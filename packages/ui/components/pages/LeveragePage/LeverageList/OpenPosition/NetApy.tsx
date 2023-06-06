import { HStack, Text, useColorModeValue } from '@chakra-ui/react';
import type { OpenPosition } from '@midas-capital/types';
import { utils } from 'ethers';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { useBaseCollateral } from '@ui/hooks/leverage/useBaseCollateral';
import { useCurrentLeverageRatio } from '@ui/hooks/leverage/useCurrentLeverageRatio';
import { useGetNetApy } from '@ui/hooks/leverage/useGetNetApy';
import { useAssets } from '@ui/hooks/useAssets';
import { useRewardsForMarket } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import { smallFormatter } from '@ui/utils/bigUtils';

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

  const { data: baseCollateral } = useBaseCollateral(positionAddress, position.chainId);
  const { data: currentLeverageRatio } = useCurrentLeverageRatio(positionAddress, position.chainId);
  const borrowApyColor = useColorModeValue('orange.500', 'orange');
  const { data: currentNetApy } = useGetNetApy(
    collateralCToken,
    borrowCToken,
    baseCollateral,
    currentLeverageRatio,
    totalSupplyApyPerAsset && totalSupplyApyPerAsset[collateralCToken] !== undefined
      ? utils.parseUnits(totalSupplyApyPerAsset[collateralCToken].toString())
      : undefined,
    position.chainId
  );

  return currentNetApy !== undefined && currentNetApy !== null ? (
    <HStack justifyContent="flex-end">
      <EllipsisText
        maxWidth="300px"
        tooltip={currentNetApy ? smallFormatter(currentNetApy, true, 18) : ''}
      >
        <Text color={borrowApyColor}>
          {currentNetApy !== undefined && currentNetApy !== null
            ? smallFormatter(currentNetApy)
            : '?'}
          %
        </Text>
      </EllipsisText>
    </HStack>
  ) : null;
};
