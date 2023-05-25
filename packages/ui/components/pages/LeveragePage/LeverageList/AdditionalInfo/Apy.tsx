import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
import type { SupportedChains } from '@midas-capital/types';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const Apy = ({
  amount,
  borrowRatePerBlock,
  borrowToken,
  chainId,
  collateralCToken,
  leverageValue,
  supplyRatePerBlock,
  totalSupplied,
}: {
  amount: BigNumber;
  borrowRatePerBlock: BigNumber;
  borrowToken: string;
  chainId: SupportedChains;
  collateralCToken: string;
  leverageValue: number;
  supplyRatePerBlock: BigNumber;
  totalSupplied: BigNumber;
}) => {
  const sdk = useSdk(chainId);
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
      if (sdk) {
        const bigApy = await sdk.getUpdatedApy(
          collateralCToken,
          amount.mul(utils.parseUnits(leverageValue.toString())).div(constants.WeiPerEther)
        );
        setUpdatedSupplyApy(Number(utils.formatUnits(bigApy)));
      }
    };

    func();
  }, [sdk, collateralCToken, amount, leverageValue]);

  useEffect(() => {
    const func = async () => {
      if (sdk) {
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
  }, [sdk, collateralCToken, amount, leverageValue, borrowToken, totalSupplied]);

  return (
    <Flex height="100%" justifyContent="center">
      <VStack alignItems="flex-start" height="100%" justifyContent="center" spacing={4}>
        <HStack spacing={4}>
          <HStack justifyContent="flex-end" width="90px">
            <Text size="md">Yield</Text>
          </HStack>
          <HStack>
            <Text>{supplyAPY}%</Text>
            <Text>➡</Text>
            <Text>{updatedSupplyApy}%</Text>
          </HStack>
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
            <Text>20%</Text>
          </HStack>
        </HStack>
      </VStack>
    </Flex>
  );
};
