import { Flex, Skeleton, Text, VStack } from '@chakra-ui/react';

import { CardBox } from '@ui/components/shared/IonicBox';

export const Lending = () => {
  return (
    <CardBox>
      <Flex direction="column" gap="20px">
        <Text fontSize="24px" fontWeight={600} lineHeight="34px">
          Lending
        </Text>
        <Flex direction={{ base: 'row' }} gap="32px">
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Tvl
            </Text>
            <Skeleton isLoaded={true}>
              <Text size="lg">$0.00</Text>
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Apr
            </Text>
            <Skeleton isLoaded={true}>
              <Text size="lg">4.1%</Text>
            </Skeleton>
          </VStack>
        </Flex>
      </Flex>
    </CardBox>
  );
};
