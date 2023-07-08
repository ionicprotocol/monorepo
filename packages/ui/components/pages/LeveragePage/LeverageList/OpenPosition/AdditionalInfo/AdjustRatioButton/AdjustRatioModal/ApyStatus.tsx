import { Flex, HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import type { OpenPosition } from '@ionicprotocol/types';
import { utils } from 'ethers';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { IonicBox } from '@ui/components/shared/IonicBox';
import { useCurrentLeverageRatio } from '@ui/hooks/leverage/useCurrentLeverageRatio';
import { useEquityAmount } from '@ui/hooks/leverage/useEquityAmount';
import { useGetNetApy } from '@ui/hooks/leverage/useGetNetApy';
import { useAssets } from '@ui/hooks/useAssets';
import { useRewardsForMarket } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import { smallFormatter } from '@ui/utils/bigUtils';

export const ApyStatus = ({
  position,
  leverageValue,
}: {
  leverageValue: number;
  position: OpenPosition;
}) => {
  const {
    collateral: collateralAsset,
    borrowable: borrowAsset,
    chainId,
    address: positionAddress,
  } = position;
  const {
    cToken: collateralCToken,
    symbol: collateralSymbol,
    pool: poolAddress,
    supplyRatePerBlock,
    plugin,
    underlyingToken: collateralUnderlying,
  } = collateralAsset;
  const { cToken: borrowCToken } = borrowAsset;

  const { data: allRewards } = useRewardsForMarket({
    asset: {
      cToken: collateralCToken,
      plugin,
    },
    chainId: Number(chainId),
    poolAddress,
  });
  const { data: assetInfos } = useAssets([chainId]);
  const { data: totalSupplyApyPerAsset } = useTotalSupplyAPYs(
    [
      {
        cToken: collateralCToken,
        supplyRatePerBlock,
        underlyingSymbol: collateralSymbol,
        underlyingToken: collateralUnderlying,
      },
    ],
    chainId,
    allRewards,
    assetInfos
  );

  const { data: baseCollateral } = useEquityAmount(positionAddress, chainId);
  const { data: currentLeverageRatio } = useCurrentLeverageRatio(positionAddress, chainId);

  const { data: currentNetApy, isLoading } = useGetNetApy(
    collateralCToken,
    borrowCToken,
    baseCollateral,
    currentLeverageRatio,
    totalSupplyApyPerAsset && totalSupplyApyPerAsset[collateralCToken] !== undefined
      ? utils.parseUnits(totalSupplyApyPerAsset[collateralCToken].totalApy.toString())
      : undefined,
    chainId
  );

  const { data: updatedNetApy, isLoading: isUpdating } = useGetNetApy(
    collateralCToken,
    borrowCToken,
    baseCollateral,
    leverageValue,
    totalSupplyApyPerAsset && totalSupplyApyPerAsset[collateralCToken] !== undefined
      ? utils.parseUnits(totalSupplyApyPerAsset[collateralCToken].totalApy.toString())
      : undefined,
    chainId
  );

  return (
    <IonicBox py={4} width="100%">
      <Flex height="100%" justifyContent="center">
        <VStack alignItems="flex-start" height="100%" justifyContent="center" spacing={4}>
          <HStack spacing={4}>
            <HStack justifyContent="flex-end" width="90px">
              <Text size="md">Net APY</Text>
            </HStack>
            <HStack>
              {isLoading ? (
                <Skeleton height="20px" width="45px" />
              ) : (
                <EllipsisText
                  maxWidth="300px"
                  tooltip={
                    currentNetApy !== undefined && currentNetApy !== null
                      ? smallFormatter(currentNetApy, true, 18)
                      : ''
                  }
                >
                  {currentNetApy !== undefined && currentNetApy !== null
                    ? smallFormatter(currentNetApy)
                    : '?'}
                  %
                </EllipsisText>
              )}
              <Text>➡</Text>
              {isUpdating ? (
                <Skeleton height="20px" width="45px" />
              ) : (
                <EllipsisText
                  maxWidth="300px"
                  tooltip={updatedNetApy ? smallFormatter(updatedNetApy, true, 18) : ''}
                >
                  {updatedNetApy !== undefined && updatedNetApy !== null
                    ? smallFormatter(updatedNetApy)
                    : '?'}
                  %
                </EllipsisText>
              )}
            </HStack>
          </HStack>
        </VStack>
      </Flex>
    </IonicBox>
  );
};
