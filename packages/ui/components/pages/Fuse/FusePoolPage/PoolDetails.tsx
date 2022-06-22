import {
  Button,
  Heading,
  Link,
  Skeleton,
  Table,
  TableRowProps,
  Tbody,
  Td,
  Tr,
  useClipboard,
} from '@chakra-ui/react';
import { utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import RouterLink from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';

import { MidasBox } from '@ui/components/shared/Box';
import { Center, Column, Row } from '@ui/components/shared/Flex';
import { useRari } from '@ui/context/RariContext';
import { useExtraPoolInfo } from '@ui/hooks/fuse/useExtraPoolInfo';
import { useColors } from '@ui/hooks/useColors';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import { shortUsdFormatter } from '@ui/utils/bigUtils';
import { shortAddress } from '@ui/utils/shortAddress';

const PoolDetails = ({ data: poolData }: { data: ReturnType<typeof useFusePoolData>['data'] }) => {
  const isMobile = useIsMobile();

  const assets = poolData?.assets ?? [];
  const totalSuppliedFiat = poolData?.totalSuppliedFiat ?? 0;
  const totalBorrowedFiat = poolData?.totalBorrowedFiat ?? 0;
  const totalAvailableLiquidityFiat = poolData?.totalAvailableLiquidityFiat ?? 0;
  const comptrollerAddress = poolData?.comptroller ?? '';

  const { cCard } = useColors();
  const router = useRouter();
  const poolId = router.query.poolId as string;
  const data = useExtraPoolInfo(comptrollerAddress || '');
  const { hasCopied, onCopy } = useClipboard(data?.admin ?? '');
  const { setLoading, currentChain } = useRari();
  const { fuse } = useRari();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const acceptOwnership = useCallback(async () => {
    if (!comptrollerAddress) return;
    setIsLoading(true);
    const unitroller = fuse.createUnitroller(comptrollerAddress);
    const tx = await unitroller._acceptAdmin();
    await tx.wait();
    setIsLoading(false);
  }, [comptrollerAddress, fuse]);

  return (
    <MidasBox height={isMobile ? 'auto' : '450px'}>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        height="100%"
        width="100%"
        pb={2}
      >
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
          px={4}
          height="60px"
          flexShrink={0}
        >
          <Heading size="sm">{`Pool Details`}</Heading>

          {data?.isPowerfulAdmin ? (
            <RouterLink href={`/${currentChain.id}/pool/${poolId}/edit`} passHref>
              <Link className="no-underline" ml={4}>
                <Center px={2} fontWeight="bold" cursor="pointer" onClick={() => setLoading(true)}>
                  Edit
                </Center>
              </Link>
            </RouterLink>
          ) : data?.isPendingAdmin ? (
            <Button onClick={acceptOwnership} isLoading={isLoading} isDisabled={isLoading}>
              Accept Ownership
            </Button>
          ) : null}
        </Row>

        {poolData ? (
          <Table variant={'simple'} size={'sm'} width="100%" height={'100%'} colorScheme="teal">
            <Tbody>
              <StatRow
                statATitle={'Total Supplied'}
                statA={shortUsdFormatter(totalSuppliedFiat)}
                statBTitle={'Total Borrowed'}
                statB={shortUsdFormatter(totalBorrowedFiat)}
              />
              <StatRow
                statATitle={'Available Liquidity'}
                statA={shortUsdFormatter(totalAvailableLiquidityFiat)}
                statBTitle={'Pool Utilization'}
                statB={
                  totalSuppliedFiat.toString() === '0'
                    ? '0%'
                    : (totalBorrowedFiat / totalSuppliedFiat / 100).toFixed(2) + '%'
                }
              />
              <StatRow
                statATitle={'Upgradeable'}
                statA={data ? (data.upgradeable ? 'Yes' : 'No') : '?'}
                statBTitle={hasCopied ? 'Admin (copied!)' : 'Admin (click to copy)'}
                statB={data?.admin ? shortAddress(data.admin, 4, 2) : '?'}
                onClick={onCopy}
              />
              <StatRow
                statATitle={'Platform Fee'}
                statA={
                  assets.length > 0
                    ? Number(utils.formatUnits(assets[0].fuseFee, 16)).toPrecision(2) + '%'
                    : '10%'
                }
                statBTitle={'Average Admin Fee'}
                statB={
                  assets
                    .reduce(
                      (a, b, _, { length }) =>
                        a + Number(utils.formatUnits(b.adminFee, 16)) / length,
                      0
                    )
                    .toFixed(1) + '%'
                }
              />
              <StatRow
                statATitle={'Close Factor'}
                statA={
                  data?.closeFactor
                    ? data.closeFactor.div(parseUnits('1', 16)).toNumber() + '%'
                    : '?%'
                }
                statBTitle={'Liquidation Incentive'}
                statB={
                  data?.liquidationIncentive
                    ? data.liquidationIncentive.div(parseUnits('1', 16)).toNumber() - 100 + '%'
                    : '?%'
                }
              />
              <StatRow
                statATitle={'Oracle'}
                statA={data ? data.oracle : '?'}
                statBTitle={'Whitelist'}
                statB={data ? (data.enforceWhitelist ? 'Yes' : 'No') : '?'}
              />
              {comptrollerAddress && (
                <Tr borderTopWidth={'1px'} borderColor={cCard.dividerColor}>
                  <Td
                    fontSize={{ base: '3vw', sm: '0.9rem' }}
                    wordBreak={'break-all'}
                    lineHeight={1.5}
                    colSpan={2}
                    textAlign="left"
                    border="none"
                  >
                    Pool Address: <b>{comptrollerAddress}</b>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        ) : (
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            height="100%"
            width="100%"
            pb={1}
          >
            <Skeleton width="100%" height="100%"></Skeleton>
          </Column>
        )}
      </Column>
    </MidasBox>
  );
};

const StatRow = ({
  statATitle,
  statA,
  statBTitle,
  statB,
  ...tableRowProps
}: {
  statATitle: string;
  statA: string;
  statBTitle: string;
  statB: string;
} & TableRowProps) => {
  const { cCard } = useColors();
  return (
    <Tr borderTopWidth={'1px'} borderColor={cCard.dividerColor} {...tableRowProps}>
      <Td
        fontSize={{ base: '3vw', sm: '0.9rem' }}
        wordBreak={'break-all'}
        width={'50%'}
        lineHeight={1.5}
        textAlign="left"
        border="none"
      >
        {statATitle}: <b>{statA}</b>
      </Td>

      <Td
        fontSize={{ base: '3vw', sm: '0.9rem' }}
        wordBreak={'break-all'}
        width={'50%'}
        lineHeight={1.5}
        textAlign="left"
        border="none"
      >
        {statBTitle}: <b>{statB}</b>
      </Td>
    </Tr>
  );
};

export default PoolDetails;
