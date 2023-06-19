import type { LeveredCollateral } from '@midas-capital/types';

import { useAssets } from '@ui/hooks/useAssets';
import { useRewardsForMarket } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';

export function usePositionSupplyApy(positionCollateral: LeveredCollateral, chainId: number) {
  const { data: allRewards } = useRewardsForMarket({
    asset: {
      cToken: positionCollateral.cToken,
      plugin: positionCollateral.plugin,
    },
    chainId: Number(chainId),
    poolAddress: positionCollateral.pool,
  });
  const { data: assetInfos } = useAssets(chainId);
  const { data: totalSupplyApyPerAsset } = useTotalSupplyAPYs(
    [
      {
        cToken: positionCollateral.cToken,
        supplyRatePerBlock: positionCollateral.supplyRatePerBlock,
        underlyingSymbol: positionCollateral.symbol,
        underlyingToken: positionCollateral.underlyingToken,
      },
    ],
    chainId,
    allRewards,
    assetInfos
  );

  return totalSupplyApyPerAsset;
}
