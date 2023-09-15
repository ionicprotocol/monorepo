import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Flex, Skeleton, Text, VStack } from '@chakra-ui/react';

import { CardBox } from '@ui/components/shared/IonicBox';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';

export const Overview = () => {
  return (
    <CardBox>
      <Flex direction="column" gap="20px">
        <Text fontSize="24px" fontWeight={600} lineHeight="34px">
          Overview
        </Text>
        <Flex direction={{ base: 'row' }} gap="32px">
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Your Value
            </Text>
            <Skeleton isLoaded={true}>
              <Text size="lg">$26.16</Text>
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Your Borrow
            </Text>
            <Skeleton isLoaded={true}>
              <Text size="lg">$15.70</Text>
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Flex direction="row" gap={1} height="18px">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Your Net
              </Text>
              <SimpleTooltip label={'Net'}>
                <InfoOutlineIcon
                  color={'iLightGray'}
                  height="fit-content"
                  ml={1}
                  verticalAlign="baseLine"
                />
              </SimpleTooltip>
            </Flex>
            <Text size={'lg'}>$10.47</Text>
          </VStack>
          <VStack alignItems="flex-start">
            <Flex direction="row" gap={1} height="18px">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Your Roi
              </Text>
              <SimpleTooltip label={'Roi'}>
                <InfoOutlineIcon
                  color={'iLightGray'}
                  height="fit-content"
                  ml={1}
                  verticalAlign="baseLine"
                />
              </SimpleTooltip>
            </Flex>
            <Text size={'lg'}>$0.00</Text>
          </VStack>
        </Flex>
      </Flex>
    </CardBox>
  );
};
