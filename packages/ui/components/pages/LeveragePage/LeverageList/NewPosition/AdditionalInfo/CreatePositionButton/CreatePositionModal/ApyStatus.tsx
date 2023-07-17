import { Flex, HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import type { LeveredBorrowable, LeveredCollateral, SupportedChains } from '@ionicprotocol/types';
import type { BigNumber } from 'ethers';
import { utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { CardBox } from '@ui/components/shared/IonicBox';
import { LEVERAGE_VALUE } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useGetNetApy } from '@ui/hooks/leverage/useGetNetApy';
import { useAssets } from '@ui/hooks/useAssets';
import { useRewardsForMarket } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import { smallFormatter } from '@ui/utils/bigUtils';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const ApyStatus = ({
  amount,
  borrowAsset,
  chainId,
  collateralAsset,
  leverageValue,
}: {
  amount: BigNumber;
  borrowAsset: LeveredBorrowable;
  chainId: SupportedChains;
  collateralAsset: LeveredCollateral;
  leverageValue: number;
}) => {
  const {
    cToken: collateralCToken,
    symbol: collateralSymbol,
    pool: poolAddress,
    supplyRatePerBlock,
    plugin,
    totalSupplied,
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

  const { data: netApy, isLoading } = useGetNetApy(
    collateralCToken,
    borrowCToken,
    amount,
    leverageValue,
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
      if (
        sdk &&
        !Number.isNaN(leverageValue) &&
        leverageValue >= LEVERAGE_VALUE.MIN &&
        leverageValue <= LEVERAGE_VALUE.MAX
      ) {
        try {
          const bigApr = await sdk.getPositionBorrowApr(
            collateralCToken,
            borrowCToken,
            utils.parseUnits(leverageValue.toString()),
            amount
          );
          setUpdatedBorrowApr(Number(utils.formatUnits(bigApr)));
        } catch (e) {}
      }
    };

    func();
  }, [sdk, collateralCToken, amount, leverageValue, borrowCToken, totalSupplied]);

  return (
    <CardBox py={4} width="100%">
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
                  {totalSupplyApyPerAsset[collateralCToken] !== undefined
                    ? smallFormatter(totalSupplyApyPerAsset[collateralCToken].totalApy * 100)
                    : '?'}
                  %
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
                {borrowAPY ? smallFormatter(borrowAPY) : '?'}%
              </EllipsisText>
              <Text>➡</Text>
              <EllipsisText
                maxWidth="300px"
                tooltip={updatedBorrowApr ? smallFormatter(updatedBorrowApr, true, 18) : ''}
              >
                {updatedBorrowApr ? smallFormatter(updatedBorrowApr) : '?'}%
              </EllipsisText>
            </HStack>
          </HStack>
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
                    netApy !== undefined && netApy !== null ? smallFormatter(netApy, true, 18) : ''
                  }
                >
                  {netApy !== undefined && netApy !== null ? smallFormatter(netApy) : '?'}%
                </EllipsisText>
              )}
            </HStack>
          </HStack>
        </VStack>
      </Flex>
    </CardBox>
  );
};
