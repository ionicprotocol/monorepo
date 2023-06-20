import type { LeveredCollateral } from '@midas-capital/types';

import { useAssets } from '@ui/hooks/useAssets';
import { useRewardsForMarkets } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';

export function usePositionsSupplyApy(collaterals: LeveredCollateral[], chainIds: number[]) {
  const assets = collaterals.map((collateral) => {
    return {
      cToken: collateral.cToken,
      plugin: collateral.plugin,
      supplyRatePerBlock: collateral.supplyRatePerBlock,
      underlyingSymbol: collateral.symbol,
      underlyingToken: collateral.underlyingToken,
    };
  });

  const pools = collaterals.map((collateral) => {
    return collateral.pool;
  });

  const { data: allRewards } = useRewardsForMarkets(assets, pools, chainId);
  const { data: assetInfos } = useAssets(chainIds);
  const { data: totalSupplyApyPerAsset } = useTotalSupplyAPYs(
    assets,
    chainId,
    allRewards,
    assetInfos
  );

  return totalSupplyApyPerAsset;
}
