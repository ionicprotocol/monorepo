import { Flex, HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import type { OpenPosition } from '@ionicprotocol/types';
import type { BigNumber } from 'ethers';

import { MidasBox } from '@ui/components/shared/Box';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { useCurrentLeverageRatio } from '@ui/hooks/leverage/useCurrentLeverageRatio';
import { useUpdatedLeverageRatioAfterFunding } from '@ui/hooks/leverage/useUpdatedLeverageRatioAfterFunding';

export const ApyStatus = ({ amount, position }: { amount: BigNumber; position: OpenPosition }) => {
  const { chainId, address: positionAddress } = position;
  const { data: currentLeverageRatio, isLoading: isGetting } = useCurrentLeverageRatio(
    positionAddress,
    chainId
  );
  const { data: updatedLeverageRatio, isLoading: isUpdating } = useUpdatedLeverageRatioAfterFunding(
    positionAddress,
    amount,
    chainId
  );

  return (
    <MidasBox py={4} width="100%">
      <Flex height="100%" justifyContent="center">
        <VStack alignItems="flex-start" height="100%" justifyContent="center" spacing={4}>
          <HStack spacing={4}>
            <HStack justifyContent="flex-end" width="150px">
              <Text size="md">Leverage Ratio</Text>
            </HStack>
            <HStack>
              {isGetting ? (
                <Skeleton height="20px" width="45px" />
              ) : (
                <EllipsisText
                  maxWidth="300px"
                  tooltip={currentLeverageRatio ? currentLeverageRatio.toString() : ''}
                >
                  {currentLeverageRatio ? currentLeverageRatio.toFixed(3) : '?'} x
                </EllipsisText>
              )}
              <Text>➡</Text>
              {isUpdating ? (
                <Skeleton height="20px" width="45px" />
              ) : (
                <EllipsisText
                  maxWidth="300px"
                  tooltip={updatedLeverageRatio ? updatedLeverageRatio.toString() : ''}
                >
                  {updatedLeverageRatio ? updatedLeverageRatio.toFixed(3) : '?'} x
                </EllipsisText>
              )}
            </HStack>
          </HStack>
        </VStack>
      </Flex>
    </MidasBox>
  );
};
