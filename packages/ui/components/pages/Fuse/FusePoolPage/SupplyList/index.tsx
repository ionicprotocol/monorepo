import { Box, Table, TableCaption, Tbody, Td, Thead, Tr } from '@chakra-ui/react';
import { FlywheelMarketRewardsInfo } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useMemo } from 'react';

import { AssetSupplyRow } from '@ui/components/pages/Fuse/FusePoolPage/SupplyList/AssetSupplyRow';
import { useColors } from '@ui/hooks/useColors';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { sortAssets } from '@ui/utils/sortAssets';

interface SupplyListProps {
  assets: MarketData[];
  supplyBalanceFiat: number;
  comptrollerAddress: string;
  rewards?: FlywheelMarketRewardsInfo[];
}

export const SupplyList = ({
  assets,
  supplyBalanceFiat,
  comptrollerAddress,
  rewards = [],
}: SupplyListProps) => {
  const suppliedAssets = useMemo(
    () => sortAssets(assets).filter((asset) => asset.supplyBalance.gt(0)),

    [assets]
  );
  const nonSuppliedAssets = useMemo(
    () => sortAssets(assets).filter((asset) => asset.supplyBalance.eq(0)),
    [assets]
  );

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
          Your Supply Balance: {smallUsdFormatter(supplyBalanceFiat)}
        </TableCaption>
        <Thead>
          {assets.length > 0 ? (
            <Tr>
              <Td fontWeight={'bold'} fontSize={{ base: '2.9vw', sm: '0.9rem' }}>
                Asset/LTV
              </Td>

              <Td></Td>

              {isMobile ? null : (
                <Td
                  fontWeight={'bold'}
                  fontSize={{ base: '2.9vw', sm: '0.9rem' }}
                  textAlign={'right'}
                >
                  APY/Reward
                </Td>
              )}

              <Td
                isNumeric
                fontWeight={'bold'}
                textAlign={'right'}
                fontSize={{ base: '2.9vw', sm: '0.9rem' }}
              >
                Balance
              </Td>

              <Td fontWeight={'bold'} textAlign="center" fontSize={{ base: '2.9vw', sm: '0.9rem' }}>
                Collateral
              </Td>
            </Tr>
          ) : null}
        </Thead>
        <Tbody>
          {assets.length > 0 ? (
            <>
              {suppliedAssets.map((asset, index) => {
                return (
                  <AssetSupplyRow
                    comptrollerAddress={comptrollerAddress}
                    key={asset.underlyingToken}
                    assets={suppliedAssets}
                    index={index}
                    rewards={rewards}
                  />
                );
              })}

              {suppliedAssets.length > 0 && nonSuppliedAssets.length > 0 && (
                <Tr borderWidth={1} borderColor={cCard.dividerColor}></Tr>
              )}

              {nonSuppliedAssets.map((asset, index) => {
                return (
                  <AssetSupplyRow
                    comptrollerAddress={comptrollerAddress}
                    key={asset.underlyingToken}
                    assets={nonSuppliedAssets}
                    index={index}
                    rewards={rewards}
                  />
                );
              })}
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
