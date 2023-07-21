import { Flex, Skeleton, Text, VStack } from '@chakra-ui/react';

import { CardBox } from '@ui/components/shared/IonicBox';
import { useTotalSupplyAndBorrow } from '@ui/hooks/ionic/useTotalSupplyAndBorrow';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

export const Platform = () => {
  const { data, isLoading } = useTotalSupplyAndBorrow();

  return (
    <CardBox>
      <Flex direction="column" gap="20px">
        <Text fontSize="24px" fontWeight={600} lineHeight="34px">
          Platform
        </Text>
        <Flex direction={{ base: 'row' }} gap="32px">
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              TVL
            </Text>
            <Skeleton isLoaded={!isLoading} minW="80px">
              <Text color={'iWhite'} size={'lg'}>
                {data ? smallUsdFormatter(data.totalSupply, true) : '-'}
              </Text>
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Vaults
            </Text>
            <Text color={'iWhite'} size={'lg'}>
              666
            </Text>
          </VStack>
          <VStack alignItems="flex-start">
            <Flex direction="row" gap={1}>
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Daily Buyback
              </Text>
            </Flex>
            <Text color={'iWhite'} size={'lg'}>
              $1,212
            </Text>
          </VStack>
        </Flex>
      </Flex>
    </CardBox>
  );
};
