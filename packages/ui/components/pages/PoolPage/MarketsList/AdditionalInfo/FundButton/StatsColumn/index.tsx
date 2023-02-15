import { Divider } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { BigNumber, utils } from 'ethers';
import { useMemo } from 'react';

import { MidasBox } from '@ui/components/shared/Box';
import { Column } from '@ui/components/shared/Flex';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import useUpdatedUserAssets from '@ui/hooks/fuse/useUpdatedUserAssets';
import { useBorrowLimitMarket } from '@ui/hooks/useBorrowLimitMarket';
import { useBorrowLimitTotal } from '@ui/hooks/useBorrowLimitTotal';
import { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';
import { BorrowAPY } from './BorrowAPY';
import { BorrowsMarket } from './BorrowsMarket';
import { BorrowsTotal } from './BorrowsTotal';
import { Supplied } from './Supplied';
import { SupplyAPY } from './SupplyAPY';

interface StatsColumnProps {
  mode: FundOperationMode;
  assets: MarketData[];
  asset: MarketData;
  amount: BigNumber;
  enableAsCollateral?: boolean;
  poolChainId: number;
  comptrollerAddress: string;
}
export const StatsColumn = ({
  mode,
  assets,
  asset,
  amount,
  enableAsCollateral = false,
  poolChainId,
  comptrollerAddress,
}: StatsColumnProps) => {
  const index = useMemo(() => assets.findIndex((a) => a.cToken === asset.cToken), [assets, asset]);
  // Get the new representation of a user's NativePricedFuseAssets after proposing a supply amount.
  const { data: updatedAssets } = useUpdatedUserAssets({
    mode,
    assets,
    index,
    amount,
    poolChainId,
  });

  const updatedAsset = updatedAssets ? updatedAssets[index] : null;

  const { currentSdk, currentChain } = useMultiMidas();
  if (!currentSdk || !currentChain) throw new Error("SDK doesn't exist!");

  const {
    supplyAPY,
    borrowAPR,
    updatedSupplyAPY,
    updatedBorrowAPR,
    supplyBalanceFrom,
    supplyBalanceTo,
    totalBorrows,
    updatedTotalBorrows,
  } = useMemo(() => {
    const blocksPerMinute = getBlockTimePerMinuteByChainId(currentChain.id);
    return {
      supplyAPY: currentSdk.ratePerBlockToAPY(asset.supplyRatePerBlock, blocksPerMinute),
      borrowAPR: currentSdk.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMinute),
      updatedSupplyAPY: updatedAsset
        ? currentSdk.ratePerBlockToAPY(updatedAsset.supplyRatePerBlock, blocksPerMinute)
        : undefined,
      updatedBorrowAPR: updatedAsset
        ? currentSdk.ratePerBlockToAPY(updatedAsset.borrowRatePerBlock, blocksPerMinute)
        : undefined,
      supplyBalanceFrom: utils.commify(
        utils.formatUnits(asset.supplyBalance, asset.underlyingDecimals)
      ),
      supplyBalanceTo: updatedAsset
        ? utils.commify(
            utils.formatUnits(updatedAsset.supplyBalance, updatedAsset.underlyingDecimals)
          )
        : undefined,
      totalBorrows: assets.reduce((acc, cur) => acc + cur.borrowBalanceFiat, 0),
      updatedTotalBorrows: updatedAssets
        ? updatedAssets.reduce((acc, cur) => acc + cur.borrowBalanceFiat, 0)
        : undefined,
    };
  }, [currentChain, updatedAsset, asset, assets, updatedAssets, currentSdk]);

  // Calculate Old and new Borrow Limits
  const { data: borrowLimitTotal } = useBorrowLimitTotal(assets, poolChainId);
  const { data: updatedBorrowLimitTotal } = useBorrowLimitTotal(updatedAssets ?? [], poolChainId, {
    ignoreIsEnabledCheckFor: enableAsCollateral ? asset.cToken : undefined,
  });
  const { data: borrowLimitMarket } = useBorrowLimitMarket(
    asset,
    assets,
    poolChainId,
    comptrollerAddress
  );
  const { data: updatedBorrowLimitMarket } = useBorrowLimitMarket(
    asset,
    updatedAssets ?? [],
    poolChainId,
    comptrollerAddress,
    {
      ignoreIsEnabledCheckFor: enableAsCollateral ? asset.cToken : undefined,
    }
  );

  return (
    <MidasBox width="100%">
      <Column
        crossAxisAlignment="flex-start"
        expand
        gap={2}
        mainAxisAlignment="space-between"
        px={2}
        py={2}
      >
        <Supplied current={supplyBalanceFrom} new={supplyBalanceTo} asset={asset} />

        <Divider />

        <BorrowsMarket
          asset={asset}
          updatedAsset={updatedAsset}
          borrowLimitMarket={borrowLimitMarket}
          updatedBorrowLimitMarket={updatedBorrowLimitMarket}
        />

        <BorrowsTotal
          totalBorrows={totalBorrows}
          updatedTotalBorrows={updatedTotalBorrows}
          borrowLimitTotal={borrowLimitTotal}
          updatedBorrowLimitTotal={updatedBorrowLimitTotal}
        />

        <Divider />

        <SupplyAPY current={supplyAPY} new={updatedSupplyAPY} />

        <BorrowAPY current={borrowAPR} new={updatedBorrowAPR} />
      </Column>
    </MidasBox>
  );
};
