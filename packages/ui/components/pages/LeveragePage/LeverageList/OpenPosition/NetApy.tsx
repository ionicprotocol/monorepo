import { Text } from '@chakra-ui/react';
import type { OpenPosition } from '@midas-capital/types';
import { utils } from 'ethers';

import { useGetNetApy } from '@ui/hooks/leverage/useGetNetApy';
import { useAssets } from '@ui/hooks/useAssets';
import { useRewardsForMarket } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';

export const NetApy = ({ position }: { position: OpenPosition }) => {
  const {
    cToken: collateralCToken,
    symbol: collateralSymbol,
    pool: poolAddress,
    supplyRatePerBlock,
    plugin,
    underlyingToken: collateralUnderlying,
  } = position.collateral;
  const { cToken: borrowCToken, position: positionAddress } = position.borrowable;

  const { data: allRewards } = useRewardsForMarket({
    asset: {
      cToken: collateralCToken,
      plugin,
    },
    chainId: Number(position.chainId),
    poolAddress,
  });
  const { data: assetInfos } = useAssets(position.chainId);

  const { data: totalSupplyApyPerAsset } = useTotalSupplyAPYs(
    [
      {
        cToken: collateralCToken,
        supplyRatePerBlock,
        underlyingSymbol: collateralSymbol,
        underlyingToken: collateralUnderlying,
      },
    ],
    position.chainId,
    allRewards,
    assetInfos
  );

  const { data: currentNetApy } = useGetNetApy(
    positionAddress,
    collateralCToken,
    borrowCToken,
    totalSupplyApyPerAsset && totalSupplyApyPerAsset[collateralCToken] !== undefined
      ? utils.parseUnits(totalSupplyApyPerAsset[collateralCToken].toString())
      : undefined,
    position.chainId
  );

  return currentNetApy ? <Text>{currentNetApy}</Text> : null;
};
