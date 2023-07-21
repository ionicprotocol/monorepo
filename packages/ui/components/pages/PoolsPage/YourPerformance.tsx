import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Flex, Skeleton, Text, VStack } from '@chakra-ui/react';

import { CardBox } from '@ui/components/shared/IonicBox';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useTotalSupplyAndBorrow } from '@ui/hooks/ionic/useTotalSupplyAndBorrow';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

export const YourPerformance = () => {
  const { data, isLoading } = useTotalSupplyAndBorrow();

  return (
    <CardBox>
      <Flex direction="column" gap="20px">
        <Text fontSize="24px" fontWeight={600} lineHeight="34px">
          Your Performance
        </Text>
        <Flex direction={{ base: 'row' }} gap="32px">
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Total Supply
            </Text>
            <Skeleton isLoaded={!isLoading}>
              {isLoading ? (
                <Text>Total Supply</Text>
              ) : (
                <Text size="lg">{data ? smallUsdFormatter(data.totalSupply, true) : '-'}</Text>
              )}
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Total Borrowed
            </Text>
            <Skeleton isLoaded={!isLoading}>
              {isLoading ? (
                <Text>Total Borrowed</Text>
              ) : (
                <Text size="lg">{data ? smallUsdFormatter(data.totalBorrow, true) : '-'}</Text>
              )}
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Flex direction="row" gap={1} height="18px">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Net APR
              </Text>
              <SimpleTooltip label={'NET APR'}>
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
