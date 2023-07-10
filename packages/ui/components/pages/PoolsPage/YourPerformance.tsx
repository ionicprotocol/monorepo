import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Flex, Skeleton, Text, VStack } from '@chakra-ui/react';
import { useMemo } from 'react';

import { CardBox } from '@ui/components/shared/IonicBox';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useTotalSupplyAndBorrow } from '@ui/hooks/fuse/useTotalSupplyAndBorrow';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

export const YourPerformance = () => {
  const { data, isLoading } = useTotalSupplyAndBorrow();

  const totalSupply = useMemo(() => {
    if (data) {
      return [...data.values()].reduce((a, c) => a + c.totalSupply, 0);
    }
  }, [data]);

  const totalBorrow = useMemo(() => {
    if (data) {
      return [...data.values()].reduce((a, c) => a + c.totalBorrow, 0);
    }
  }, [data]);

  return (
    <CardBox>
      <Flex direction="column" gap="20px">
        <Text fontSize="24px" fontWeight={600} lineHeight="34px">
          Your Performance
        </Text>
        <Flex direction={{ base: 'row' }} gap="32px">
          <VStack alignItems="flex-start">
            <Text
              color={'iLightGray'}
              fontSize="12px"
              fontWeight={500}
              lineHeight="18px"
              textTransform="uppercase"
            >
              Total supply
            </Text>
            <Skeleton isLoaded={!isLoading} minW="80px">
              <Text size="lg">{totalSupply ? smallUsdFormatter(totalSupply, true) : '-'}</Text>
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Text
              color={'iLightGray'}
              fontSize="12px"
              fontWeight={500}
              lineHeight="18px"
              textTransform="uppercase"
            >
              Total borrowed
            </Text>
            <Skeleton isLoaded={!isLoading} minW="80px">
              <Text size="lg">{totalBorrow ? smallUsdFormatter(totalBorrow, true) : '-'}</Text>
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Flex direction="row" gap={1} height="18px">
              <Text
                color={'iLightGray'}
                fontSize="12px"
                fontWeight={500}
                lineHeight="18px"
                textTransform="uppercase"
              >
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

            <Text color={'iWhite'} fontSize="20px" fontWeight={600} lineHeight="30px">
              19.97%
            </Text>
          </VStack>
        </Flex>
      </Flex>
    </CardBox>
  );
};
