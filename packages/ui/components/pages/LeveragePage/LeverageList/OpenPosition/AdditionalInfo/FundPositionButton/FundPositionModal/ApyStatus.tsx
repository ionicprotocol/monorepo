import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
import type { OpenPosition } from '@midas-capital/types';
import type { BigNumber } from 'ethers';
import { utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { MidasBox } from '@ui/components/shared/Box';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useCurrentLeverageRatio } from '@ui/hooks/leverage/useCurrentLeverageRatio';
import { useEquityAmount } from '@ui/hooks/leverage/useEquityAmount';
import { useGetNetApy } from '@ui/hooks/leverage/useGetNetApy';
import { useAssets } from '@ui/hooks/useAssets';
import { useRewardsForMarket } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import { smallFormatter } from '@ui/utils/bigUtils';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const ApyStatus = ({ amount, position }: { amount: BigNumber; position: OpenPosition }) => {
  const {
    collateral: collateralAsset,
    chainId,
    borrowable: borrowAsset,
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
  const { rate: borrowRatePerBlock, cToken: borrowCToken } = borrowAsset;
  const sdk = useSdk(chainId);
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
  const supplyAPY = useMemo(() => {
    if (sdk) {
      return sdk.ratePerBlockToAPY(supplyRatePerBlock, getBlockTimePerMinuteByChainId(sdk.chainId));
    }
  }, [sdk, supplyRatePerBlock]);
  const borrowAPY = useMemo(() => {
    if (sdk) {
      return sdk.ratePerBlockToAPY(borrowRatePerBlock, getBlockTimePerMinuteByChainId(sdk.chainId));
    }
  }, [sdk, borrowRatePerBlock]);
  const [updatedSupplyApy, setUpdatedSupplyApy] = useState<number | undefined>(supplyAPY);
  const [updatedBorrowApr, setUpdatedBorrowApr] = useState<number | undefined>(borrowAPY);

  const { data: baseCollateral } = useEquityAmount(positionAddress, chainId);
  const { data: currentLeverageRatio } = useCurrentLeverageRatio(positionAddress, chainId);

  const { data: currentNetApy } = useGetNetApy(
    collateralCToken,
    borrowCToken,
    baseCollateral,
    currentLeverageRatio,
    totalSupplyApyPerAsset && totalSupplyApyPerAsset[collateralCToken] !== undefined
      ? utils.parseUnits(totalSupplyApyPerAsset[collateralCToken].totalApy.toString())
      : undefined,
    chainId
  );

  const { data: updatedNetApy } = useGetNetApy(
    collateralCToken,
    borrowCToken,
    baseCollateral ? baseCollateral.add(amount) : amount,
    currentLeverageRatio,
    totalSupplyApyPerAsset && totalSupplyApyPerAsset[collateralCToken] !== undefined
      ? utils.parseUnits(totalSupplyApyPerAsset[collateralCToken].totalApy.toString())
      : undefined,
    chainId
  );

  useEffect(() => {
    const func = async () => {
      if (sdk) {
        const bigApy = await sdk.getPositionSupplyApy(collateralCToken, amount);
        setUpdatedSupplyApy(Number(utils.formatUnits(bigApy)) * 100);
      }
    };

    func();
  }, [sdk, collateralCToken, amount]);

  useEffect(() => {
    const func = async () => {
      if (sdk && currentLeverageRatio && baseCollateral) {
        try {
          const bigApr = await sdk.getPositionBorrowApr(
            collateralCToken,
            borrowCToken,
            baseCollateral.add(amount),
            currentLeverageRatio
          );

          setUpdatedBorrowApr(Number(utils.formatUnits(bigApr)));
        } catch (e) {}
      }
    };

    func();
  }, [sdk, collateralCToken, amount, borrowCToken, currentLeverageRatio, baseCollateral]);

  return (
    <MidasBox py={4} width="100%">
      <Flex height="100%" justifyContent="center">
        <VStack alignItems="flex-start" height="100%" justifyContent="center" spacing={4}>
          <HStack spacing={4}>
            <HStack justifyContent="flex-end" width="90px">
              <Text size="md">Yield</Text>
            </HStack>
            {totalSupplyApyPerAsset ? (
              <HStack>
                <EllipsisText
                  maxWidth="300px"
                  tooltip={
                    totalSupplyApyPerAsset[collateralCToken] !== undefined &&
                    totalSupplyApyPerAsset[collateralCToken].totalApy !== 0
                      ? smallFormatter(
                          totalSupplyApyPerAsset[collateralCToken].totalApy * 100,
                          true,
                          18
                        )
                      : ''
                  }
                >
                  <Text>
                    {totalSupplyApyPerAsset[collateralCToken] !== undefined
                      ? smallFormatter(totalSupplyApyPerAsset[collateralCToken].totalApy * 100)
                      : '?'}
                    %
                  </Text>
                </EllipsisText>
                <Text>➡</Text>
                <EllipsisText
                  maxWidth="300px"
                  tooltip={
                    totalSupplyApyPerAsset[collateralCToken] !== undefined &&
                    updatedSupplyApy !== undefined &&
                    supplyAPY !== undefined &&
                    totalSupplyApyPerAsset[collateralCToken].totalApy * 100 +
                      updatedSupplyApy -
                      supplyAPY !==
                      0
                      ? smallFormatter(
                          totalSupplyApyPerAsset[collateralCToken].totalApy * 100 +
                            updatedSupplyApy -
                            supplyAPY,
                          true,
                          18
                        )
                      : ''
                  }
                >
                  <Text>
                    {totalSupplyApyPerAsset[collateralCToken] !== undefined &&
                    updatedSupplyApy !== undefined &&
                    supplyAPY !== undefined
                      ? smallFormatter(
                          totalSupplyApyPerAsset[collateralCToken].totalApy * 100 +
                            updatedSupplyApy -
                            supplyAPY
                        )
                      : '?'}
                    %
                  </Text>
                </EllipsisText>
              </HStack>
            ) : null}
          </HStack>
          <HStack spacing={4}>
            <HStack justifyContent="flex-end" width="90px">
              <Text size="md">Borrow</Text>
            </HStack>
            <HStack>
              <EllipsisText
                maxWidth="300px"
                tooltip={borrowAPY ? smallFormatter(borrowAPY, true, 18) : ''}
              >
                <Text>{borrowAPY ? smallFormatter(borrowAPY) : '?'}%</Text>
              </EllipsisText>
              <Text>➡</Text>
              <EllipsisText
                maxWidth="300px"
                tooltip={updatedBorrowApr ? smallFormatter(updatedBorrowApr, true, 18) : ''}
              >
                <Text>{updatedBorrowApr ? smallFormatter(updatedBorrowApr) : '?'}%</Text>
              </EllipsisText>
            </HStack>
          </HStack>
          <HStack spacing={4}>
            <HStack justifyContent="flex-end" width="90px">
              <Text size="md">Net APY</Text>
            </HStack>
            <HStack>
              <EllipsisText
                maxWidth="300px"
                tooltip={
                  currentNetApy !== undefined && currentNetApy !== null
                    ? smallFormatter(currentNetApy, true, 18)
                    : ''
                }
              >
                <Text>
                  {currentNetApy !== undefined && currentNetApy !== null
                    ? smallFormatter(currentNetApy)
                    : '?'}
                  %
                </Text>
              </EllipsisText>
              <Text>➡</Text>
              <EllipsisText
                maxWidth="300px"
                tooltip={updatedNetApy ? smallFormatter(updatedNetApy, true, 18) : ''}
              >
                <Text>
                  {updatedNetApy !== undefined && updatedNetApy !== null
                    ? smallFormatter(updatedNetApy)
                    : '?'}
                  %
                </Text>
              </EllipsisText>
            </HStack>
          </HStack>
        </VStack>
      </Flex>
    </MidasBox>
  );
};
