import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Flex, Skeleton, Text, VStack } from '@chakra-ui/react';

import { CardBox } from '@ui/components/shared/IonicBox';
import { LoadingText } from '@ui/components/shared/LoadingText';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useTotalSupplyAndBorrowBalance } from '@ui/hooks/lend/useTotalSupplyAndBorrowBalance';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

export const YourPosition = () => {
  const { data, isLoading } = useTotalSupplyAndBorrowBalance();

  return (
    <CardBox>
      <Flex direction="column" gap="20px">
        <Text fontSize="24px" fontWeight={600} lineHeight="34px">
          Your Position
        </Text>
        <Flex direction={{ base: 'row' }} gap="32px">
          <VStack alignItems="flex-start">
            <Text variant={'itemTitle'}>Supply</Text>
            <Skeleton isLoaded={!isLoading}>
              {isLoading ? (
                <LoadingText />
              ) : (
                <Text size="lg">
                  {data ? smallUsdFormatter(data.totalSupplyBalance, true) : '-'}
                </Text>
              )}
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Flex direction="row" gap={1} height="18px">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Average APR
              </Text>
              <SimpleTooltip label={'Average APR'}>
                <InfoOutlineIcon
                  color={'iLightGray'}
                  height="fit-content"
                  ml={1}
                  verticalAlign="baseLine"
                />
              </SimpleTooltip>
            </Flex>
            <Text size={'lg'}>19.97%</Text>
          </VStack>
        </Flex>
      </Flex>
    </CardBox>
  );
};
