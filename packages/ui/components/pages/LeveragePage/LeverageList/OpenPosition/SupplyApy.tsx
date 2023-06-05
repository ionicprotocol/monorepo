import type { OpenPosition } from '@midas-capital/types';

import { SupplyApy as MarketSupplyApy } from '@ui/components/pages/PoolPage/MarketsList/SupplyApy';
import { useAssets } from '@ui/hooks/useAssets';
import { useRewardsForMarket } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';

export const SupplyApy = ({ position }: { position: OpenPosition }) => {
  const { data: allRewards } = useRewardsForMarket({
    asset: {
      cToken: position.collateral.cToken,
      plugin: position.collateral.plugin,
    },
    chainId: Number(position.chainId),
    poolAddress: position.collateral.pool,
  });
  const { data: assetInfos } = useAssets(position.chainId);
  const { data: totalSupplyApyPerAsset } = useTotalSupplyAPYs(
    [
      {
        cToken: position.collateral.cToken,
        supplyRatePerBlock: position.collateral.supplyRatePerBlock,
        underlyingSymbol: position.collateral.symbol,
        underlyingToken: position.collateral.underlyingToken,
      },
    ],
    position.chainId,
    allRewards,
    assetInfos
  );

  return allRewards ? (
    <MarketSupplyApy
      asset={{
        cToken: position.collateral.cToken,
        plugin: position.collateral.plugin,
        supplyRatePerBlock: position.collateral.supplyRatePerBlock,
        underlyingSymbol: position.collateral.symbol,
        underlyingToken: position.collateral.underlyingToken,
      }}
      poolChainId={position.chainId}
      rewards={allRewards}
      totalSupplyApyPerAsset={totalSupplyApyPerAsset}
    />
  ) : null;
};
