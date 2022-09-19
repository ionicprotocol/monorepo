import {
  Box,
  Button,
  HStack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Text,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';

import { AssetBorrowRow } from '@ui/components/pages/Fuse/FusePoolPage/BorrowList/AssetBorrowRow';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { DOWN_LIMIT, UP_LIMIT } from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { sortAssets } from '@ui/utils/sortAssets';

interface BorrowListProps {
  assets: MarketData[];
  borrowBalanceFiat: number;
  comptrollerAddress: string;
}

export const BorrowList = ({ assets, borrowBalanceFiat, comptrollerAddress }: BorrowListProps) => {
  const [isShow, setIsShow] = useState(false);
  const borrowedAssets = useMemo(
    () =>
      sortAssets(assets).filter((asset) => asset.borrowBalanceNative > 1 && !asset.isBorrowPaused),
    [assets]
  );
  const nonBorrowedAssets = useMemo(
    () =>
      sortAssets(assets).filter((asset) => asset.borrowBalanceNative < 1 && !asset.isBorrowPaused),
    [assets]
  );

  const unBorrowableAssets = assets.filter((asset) => asset.isBorrowPaused);

  // eslint-disable-next-line no-console
  const isMobile = useIsMobile();
  const { cCard } = useColors();

  return (
    <Box overflowX="auto">
      <Table variant={'unstyled'} size={'sm'}>
        <TableCaption
          mt="0"
          placement="top"
          textAlign={'left'}
          fontSize={{ base: '3.8vw', sm: 'lg' }}
        >
          <HStack>
            <Text>Your Borrow Balance:</Text>
            <SimpleTooltip
              label={borrowBalanceFiat.toString()}
              isDisabled={borrowBalanceFiat === DOWN_LIMIT || borrowBalanceFiat > UP_LIMIT}
            >
              <Text>
                {smallUsdFormatter(borrowBalanceFiat)}
                {borrowBalanceFiat > DOWN_LIMIT && borrowBalanceFiat < UP_LIMIT && '+'}
              </Text>
            </SimpleTooltip>
          </HStack>
        </TableCaption>
        <Thead>
          {assets.length > 0 ? (
            <Tr>
              <Td
                colSpan={isMobile ? 1 : 2}
                fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                fontWeight={'bold'}
              >
                Asset
              </Td>

              {isMobile ? null : (
                <Td
                  fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                  fontWeight={'bold'}
                  isNumeric
                  textAlign={'right'}
                >
                  APY/TVL
                </Td>
              )}

              <Td
                fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                fontWeight={'bold'}
                isNumeric
                textAlign={'right'}
              >
                Balance
              </Td>

              <Td
                fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                fontWeight={'bold'}
                isNumeric
                textAlign={'right'}
              >
                Liquidity
              </Td>
            </Tr>
          ) : null}
        </Thead>
        <Tbody>
          {assets.length > 0 ? (
            <>
              {borrowedAssets.map((asset) => {
                return (
                  <AssetBorrowRow
                    comptrollerAddress={comptrollerAddress}
                    key={asset.underlyingToken}
                    assets={assets}
                    asset={asset}
                  />
                );
              })}
              {borrowedAssets.length > 0 && nonBorrowedAssets.length > 0 && (
                <Tr borderWidth={1} borderColor={cCard.dividerColor}></Tr>
              )}
              {nonBorrowedAssets.map((asset) => {
                return (
                  <AssetBorrowRow
                    comptrollerAddress={comptrollerAddress}
                    key={asset.underlyingToken}
                    assets={assets}
                    asset={asset}
                  />
                );
              })}
              {isShow &&
                unBorrowableAssets.map((asset) => {
                  return (
                    <AssetBorrowRow
                      comptrollerAddress={comptrollerAddress}
                      key={asset.underlyingToken}
                      assets={assets}
                      asset={asset}
                    />
                  );
                })}
              {unBorrowableAssets.length !== 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <Button variant="_solid" width="100%" onClick={() => setIsShow(!isShow)}>
                      {!isShow ? 'Show unborrowable assets' : 'Hide unborrowable assets'}
                    </Button>
                  </Td>
                </Tr>
              )}
            </>
          ) : (
            <Tr>
              <Td py={8} fontSize="md" textAlign="center">
                There are no assets in this pool.
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};
