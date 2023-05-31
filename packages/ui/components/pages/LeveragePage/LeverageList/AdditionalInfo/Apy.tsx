import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
import type { SupportedChains } from '@midas-capital/types';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { LEVERAGE_VALUE } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAssets } from '@ui/hooks/useAssets';
import { useRewardsForMarket } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const Apy = ({
  amount,
  borrowRatePerBlock,
  borrowToken,
  chainId,
  collateralCToken,
  collateralSymbol,
  collateralUnderlying,
  leverageValue,
  plugin,
  poolAddress,
  range,
  supplyRatePerBlock,
  totalSupplied,
}: {
  amount: BigNumber;
  borrowRatePerBlock: BigNumber;
  borrowToken: string;
  chainId: SupportedChains;
  collateralCToken: string;
  collateralSymbol: string;
  collateralUnderlying: string;
  leverageValue: number;
  plugin?: string;
  poolAddress: string;
  range: { max: number; min: number } | null | undefined;
  supplyRatePerBlock: BigNumber;
  totalSupplied: BigNumber;
}) => {
  const minValue = range ? range.min : LEVERAGE_VALUE.MIN;
  const maxValue = range ? range.max : LEVERAGE_VALUE.MAX;
  const sdk = useSdk(chainId);
  const { data: allRewards } = useRewardsForMarket({
    asset: {
      cToken: collateralCToken,
      plugin,
    },
    chainId: Number(chainId),
    poolAddress,
  });
  const { data: assetInfos } = useAssets(chainId);
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

  useEffect(() => {
    const func = async () => {
      if (
        sdk &&
        !Number.isNaN(leverageValue) &&
        leverageValue >= minValue &&
        leverageValue <= maxValue
      ) {
        const bigApy = await sdk.getUpdatedApy(
          collateralCToken,
          amount.mul(utils.parseUnits(leverageValue.toString())).div(constants.WeiPerEther)
        );
        setUpdatedSupplyApy(Number(utils.formatUnits(bigApy)));
      }
    };

    func();
  }, [sdk, collateralCToken, amount, leverageValue, minValue, maxValue]);

  useEffect(() => {
    const func = async () => {
      if (
        sdk &&
        !Number.isNaN(leverageValue) &&
        leverageValue >= minValue &&
        leverageValue <= maxValue
      ) {
        const bigApr = await sdk.getUpdatedBorrowApr(
          collateralCToken,
          borrowToken,
          totalSupplied.add(
            amount.mul(utils.parseUnits(leverageValue.toString())).div(constants.WeiPerEther)
          ),
          utils.parseUnits(leverageValue.toString())
        );
        setUpdatedBorrowApr(Number(utils.formatUnits(bigApr)));
      }
    };

    func();
  }, [
    sdk,
    collateralCToken,
    amount,
    leverageValue,
    borrowToken,
    totalSupplied,
    minValue,
    maxValue,
  ]);

  return (
    <Flex height="100%" justifyContent="center">
      <VStack alignItems="flex-start" height="100%" justifyContent="center" spacing={4}>
        <HStack spacing={4}>
          <HStack justifyContent="flex-end" width="90px">
            <Text size="md">Yield</Text>
          </HStack>
          {totalSupplyApyPerAsset && updatedSupplyApy !== undefined && supplyAPY !== undefined ? (
            <HStack>
              <Text>{totalSupplyApyPerAsset[collateralCToken]}%</Text>
              <Text>➡</Text>
              <Text>
                {totalSupplyApyPerAsset[collateralCToken] + updatedSupplyApy - supplyAPY}%
              </Text>
            </HStack>
          ) : null}
        </HStack>
        <HStack spacing={4}>
          <HStack justifyContent="flex-end" width="90px">
            <Text size="md">Borrow</Text>
          </HStack>
          <HStack>
            <Text>{borrowAPY}%</Text>
            <Text>➡</Text>
            <Text>{updatedBorrowApr}%</Text>
          </HStack>
        </HStack>
        <HStack spacing={4}>
          <HStack justifyContent="flex-end" width="90px">
            <Text size="md">Total APR</Text>
          </HStack>
          <HStack>
            <Text>
              {totalSupplyApyPerAsset && supplyAPY !== undefined && borrowAPY !== undefined
                ? totalSupplyApyPerAsset[collateralCToken] - borrowAPY
                : '?'}
              %
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </Flex>
  );
};
