import type { LeveredPosition } from '@midas-capital/types';

import { SupplyApy as MarketSupplyApy } from '@ui/components/pages/PoolPage/MarketsList/SupplyApy';
import { useAssets } from '@ui/hooks/useAssets';
import { useRewardsForMarket } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';

export const SupplyApy = ({ leverage }: { leverage: LeveredPosition }) => {
  const { data: allRewards } = useRewardsForMarket({
    asset: {
      cToken: leverage.collateral.cToken,
      plugin: leverage.collateral.plugin,
    },
    chainId: Number(leverage.chainId),
    poolAddress: leverage.collateral.pool,
  });
  const { data: assetInfos } = useAssets(leverage.chainId);
  const { data: totalSupplyApyPerAsset } = useTotalSupplyAPYs(
    [
      {
        cToken: leverage.collateral.cToken,
        supplyRatePerBlock: leverage.collateral.supplyRatePerBlock,
        underlyingSymbol: leverage.collateral.symbol,
        underlyingToken: leverage.collateral.underlyingToken,
      },
    ],
    leverage.chainId,
    allRewards,
    assetInfos
  );

  return allRewards ? (
    <MarketSupplyApy
      asset={{
        cToken: leverage.collateral.cToken,
        plugin: leverage.collateral.plugin,
        supplyRatePerBlock: leverage.collateral.supplyRatePerBlock,
        underlyingSymbol: leverage.collateral.symbol,
        underlyingToken: leverage.collateral.underlyingToken,
      }}
      poolChainId={leverage.chainId}
      rewards={allRewards}
      totalSupplyApyPerAsset={totalSupplyApyPerAsset}
    />
  ) : null;
};
