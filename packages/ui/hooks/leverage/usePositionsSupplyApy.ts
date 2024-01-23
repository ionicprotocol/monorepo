import type { LeveredCollateral } from '@ionicprotocol/types';

import { useRewardsForPositions } from '@ui/hooks/leverage/usePositionsRewards';
import { usePositionsTotalSupplyApy } from '@ui/hooks/leverage/usePositionsTotalSupplyApy';
import { useAssets } from '@ui/hooks/useAssets';

export function usePositionsSupplyApy(
  collaterals: LeveredCollateral[],
  chainIds: number[]
) {
  const assets = collaterals.map((collateral) => {
    return {
      cToken: collateral.cToken,
      plugin: collateral.plugin,
      supplyRatePerBlock: collateral.supplyRatePerBlock,
      underlyingSymbol: collateral.symbol,
      underlyingToken: collateral.underlyingToken
    };
  });

  const pools = collaterals.map((collateral) => {
    return collateral.pool;
  });

  const { data: allRewards } = useRewardsForPositions(assets, chainIds, pools);
  const { data: assetInfos } = useAssets(chainIds);
  const { data: totalSupplyApyPerAsset } = usePositionsTotalSupplyApy(
    assets,
    chainIds,
    allRewards,
    assetInfos
  );

  return totalSupplyApyPerAsset;
}
