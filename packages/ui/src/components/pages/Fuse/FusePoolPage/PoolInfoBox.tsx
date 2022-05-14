import {
  Box,
  Button,
  Heading,
  Link,
  Select,
  Skeleton,
  Spinner,
  Stack,
  Table,
  TableRowProps,
  Tbody,
  Td,
  Text,
  Tr,
  useClipboard,
} from '@chakra-ui/react';
import { PoolDashboardBox } from '@components/pages/Fuse/FusePoolPage/PoolDashboardBox';
import CaptionedStat from '@components/shared/CaptionedStat';
import { ModalDivider } from '@components/shared/Modal';
import { useRari } from '@context/RariContext';
import { useExtraPoolInfo } from '@hooks/fuse/useExtraPoolInfo';
import { useColors } from '@hooks/useColors';
import { useFusePoolData } from '@hooks/useFusePoolData';
import { useTokenData } from '@hooks/useTokenData';
import { NativePricedFuseAsset } from '@midas-capital/sdk';
import { shortUsdFormatter } from '@utils/bigUtils';
import { Center, Column, Row, RowOrColumn, useIsMobile } from '@utils/chakraUtils';
import { FuseUtilizationChartOptions } from '@utils/chartOptions';
import { convertIRMtoCurve } from '@utils/convertIRMtoCurve';
import { shortAddress } from '@utils/shortAddress';
import { utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import dynamic from 'next/dynamic';
import RouterLink from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useQuery } from 'react-query';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export const PoolInfoBox = ({ data }: { data: ReturnType<typeof useFusePoolData>['data'] }) => {
  const isMobile = useIsMobile();
  const { cPage } = useColors();

  return (
    <RowOrColumn
      width="100%"
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      mx="auto"
      mt={4}
      isRow={!isMobile}
      bgColor={cPage.primary.bgColor}
      alignItems="stretch"
    >
      <PoolDashboardBox
        borderRadius={12}
        width={isMobile ? '100%' : '50%'}
        height={isMobile ? 'auto' : '450px'}
      >
        <OracleAndInterestRates poolData={data} />
      </PoolDashboardBox>

      <PoolDashboardBox
        ml={isMobile ? 0 : 4}
        mt={isMobile ? 4 : 0}
        width={isMobile ? '100%' : '50%'}
        borderRadius={12}
        height={isMobile ? 'auto' : '450px'}
      >
        {data ? (
          data.assets.length > 0 ? (
            <AssetAndOtherInfo assets={data.assets} />
          ) : (
            <Center height="100%">{'There are no assets in this pool.'}</Center>
          )
        ) : (
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            height="100%"
            pb={3}
          >
            <Heading
              size="sm"
              px={4}
              py={5}
              display="flex"
              width="100%"
              justifyContent="space-between"
            >
              <Text>{`Asset stats`}</Text>
              <Skeleton display="inline" w="100px"></Skeleton>
            </Heading>
            <Stack width="100%" height="100%" mx="auto">
              <Skeleton height="50%" />
              <Skeleton height="50%" />
            </Stack>
          </Column>
        )}
      </PoolDashboardBox>
    </RowOrColumn>
  );
};

const OracleAndInterestRates = ({
  poolData,
}: {
  poolData: ReturnType<typeof useFusePoolData>['data'];
}) => {
  const assets = poolData?.assets ?? [];
  const totalSuppliedNative = poolData?.totalSuppliedNative ?? 0;
  const totalBorrowedNative = poolData?.totalBorrowedNative ?? 0;
  const totalLiquidityNative = poolData?.totalLiquidityNative ?? 0;
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
              statA={shortUsdFormatter(totalSuppliedNative)}
              statBTitle={'Total Borrowed'}
              statB={shortUsdFormatter(totalBorrowedNative)}
            />
            <StatRow
              statATitle={'Available Liquidity'}
              statA={shortUsdFormatter(totalLiquidityNative)}
              statBTitle={'Pool Utilization'}
              statB={
                totalSuppliedNative.toString() === '0'
                  ? '0%'
                  : (totalBorrowedNative / totalSuppliedNative / 100).toFixed(2) + '%'
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
                    (a, b, _, { length }) => a + Number(utils.formatUnits(b.adminFee, 16)) / length,
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
              statA={data ? data.oracle ?? 'Unrecognized Oracle' : '?'}
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

const AssetOption = ({ asset }: { asset: NativePricedFuseAsset }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken);
  const { cPage } = useColors();

  return (
    <option value={asset.cToken} key={asset.cToken} style={{ color: cPage.primary.txtColor }}>
      {tokenData?.symbol ?? asset.underlyingSymbol}
    </option>
  );
};

const AssetAndOtherInfo = ({ assets }: { assets: NativePricedFuseAsset[] }) => {
  const { fuse, currentChain } = useRari();

  const [selectedAsset, setSelectedAsset] = useState(assets.length > 3 ? assets[2] : assets[0]);
  const { data: selectedTokenData } = useTokenData(selectedAsset.underlyingToken);
  const selectedAssetUtilization =
    selectedAsset.totalSupply.toString() === '0'
      ? 0
      : parseFloat(
          // Use Max.min() to cap util at 100%
          Math.min(
            (Number(utils.formatUnits(selectedAsset.totalBorrow, 18)) /
              Number(utils.formatUnits(selectedAsset.totalSupply, 18))) *
              100,
            100
          ).toFixed(0)
        );
  const { data } = useQuery(['ChartData', selectedAsset.cToken], async () => {
    const interestRateModel = await fuse.getInterestRateModel(selectedAsset.cToken);

    if (interestRateModel === null) {
      return { borrowerRates: null, supplierRates: null };
    }

    return convertIRMtoCurve(interestRateModel, currentChain.id);
  });

  const isMobile = useIsMobile();

  const { cChart } = useColors();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      width="100%"
      height="100%"
    >
      <Row
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        height="60px"
        width="100%"
        px={4}
        flexShrink={0}
      >
        <Heading size="sm" py={3}>
          {`${selectedTokenData?.symbol ?? selectedAsset.underlyingSymbol} Stats`}
        </Heading>

        <Select
          width="auto"
          onChange={(event) => {
            setSelectedAsset(
              assets.find((asset) => asset.cToken === event.target.value) || assets[0]
            );
          }}
          value={selectedAsset.cToken}
          cursor="pointer"
        >
          {assets.map((asset) => (
            <AssetOption asset={asset} key={asset.cToken} />
          ))}
        </Select>
      </Row>

      <ModalDivider />

      <Box
        height="200px"
        width="100%"
        color="#000000"
        overflow="hidden"
        px={3}
        className="hide-bottom-tooltip"
        flexShrink={0}
      >
        {data ? (
          data.supplierRates === null ? (
            <Center color="#FFFFFF" height="100%">
              <Text>No graph is available for this asset(&apos)s interest curves.</Text>
            </Center>
          ) : (
            <Chart
              options={{
                ...FuseUtilizationChartOptions,
                annotations: {
                  points: [
                    {
                      x: selectedAssetUtilization,
                      y: data.borrowerRates[selectedAssetUtilization].y,
                      marker: {
                        size: 6,
                        fillColor: '#FFF',
                        strokeColor: '#DDDCDC',
                      },
                    },
                    {
                      x: selectedAssetUtilization,
                      y: data.supplierRates[selectedAssetUtilization].y,
                      marker: {
                        size: 6,
                        fillColor: cChart.tokenColor,
                        strokeColor: '#FFF',
                      },
                    },
                  ],
                  xaxis: [
                    {
                      x: selectedAssetUtilization,
                      label: {
                        text: 'Current Utilization',
                        orientation: 'horizontal',
                        style: {
                          background: cChart.labelBgColor,
                          color: '#000',
                        },
                        // offsetX: 40,
                      },
                    },
                  ],
                },

                colors: [cChart.borrowColor, cChart.tokenColor],
              }}
              type="line"
              width="100%"
              height="100%"
              series={[
                {
                  name: 'Borrow Rate',
                  data: data.borrowerRates,
                },
                {
                  name: 'Deposit Rate',
                  data: data.supplierRates,
                },
              ]}
            />
          )
        ) : (
          <Center height="100%" color="#FFFFFF">
            <Spinner />
          </Center>
        )}
      </Box>

      <ModalDivider />

      <Row
        mainAxisAlignment="space-around"
        crossAxisAlignment="center"
        height="100%"
        width="100%"
        pt={4}
        px={4}
        pb={2}
      >
        <CaptionedStat
          stat={Number(utils.formatUnits(selectedAsset.collateralFactor, 16)).toFixed(0) + '%'}
          statSize="lg"
          captionSize="xs"
          caption={'Collateral Factor'}
          crossAxisAlignment="center"
          captionFirst={true}
        />

        <CaptionedStat
          stat={Number(utils.formatUnits(selectedAsset.reserveFactor, 16)).toFixed(0) + '%'}
          statSize="lg"
          captionSize="xs"
          caption={'Reserve Factor'}
          crossAxisAlignment="center"
          captionFirst={true}
        />
      </Row>

      <ModalDivider />

      <Row
        mainAxisAlignment="space-around"
        crossAxisAlignment="center"
        height="100%"
        width="100%"
        p={4}
        mt={3}
      >
        <CaptionedStat
          stat={shortUsdFormatter(selectedAsset.totalSupplyNative)}
          statSize="lg"
          captionSize="xs"
          caption={'Total Supplied'}
          crossAxisAlignment="center"
          captionFirst={true}
        />

        {isMobile ? null : (
          <CaptionedStat
            stat={
              selectedAsset.totalSupplyNative.toString() === '0'
                ? '0%'
                : (
                    (selectedAsset.totalBorrowNative / selectedAsset.totalSupplyNative) *
                    100
                  ).toFixed(0) + '%'
            }
            statSize="lg"
            captionSize="xs"
            caption={'Utilization'}
            crossAxisAlignment="center"
            captionFirst={true}
          />
        )}

        <CaptionedStat
          stat={shortUsdFormatter(selectedAsset.totalBorrowNative)}
          statSize="lg"
          captionSize="xs"
          caption={'Total Borrowed'}
          crossAxisAlignment="center"
          captionFirst={true}
        />
      </Row>
    </Column>
  );
};
