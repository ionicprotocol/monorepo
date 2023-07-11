import { Flex, Skeleton, Text, VStack } from '@chakra-ui/react';
import { useMemo } from 'react';

import { CardBox } from '@ui/components/shared/IonicBox';
import { useTotalSupplyAndBorrow } from '@ui/hooks/fuse/useTotalSupplyAndBorrow';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

export const Platform = () => {
  const { data, isLoading } = useTotalSupplyAndBorrow();

  const totalTVL = useMemo(() => {
    if (data) {
      return [...data.values()].reduce((a, c) => a + c.totalSupply, 0);
    }
  }, [data]);

  return (
    <CardBox>
      <Flex direction="column" gap="20px">
        <Text fontSize="24px" fontWeight={600} lineHeight="34px">
          Platform
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
              TVL
            </Text>
            <Skeleton isLoaded={!isLoading} minW="80px">
              <Text color={'iWhite'} fontSize="20px" fontWeight={600} lineHeight="30px">
                {totalTVL ? smallUsdFormatter(totalTVL, true) : '-'}
              </Text>
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
              Vaults
            </Text>
            <Text color={'iWhite'} fontSize="20px" fontWeight={600} lineHeight="30px">
              666
            </Text>
          </VStack>
          <VStack alignItems="flex-start">
            <Flex direction="row" gap={1}>
              <Text
                color={'iLightGray'}
                fontSize="12px"
                fontWeight={500}
                lineHeight="18px"
                textTransform="uppercase"
              >
                Daily Buyback
              </Text>
            </Flex>
            <Text color={'iWhite'} fontSize="20px" fontWeight={600} lineHeight="30px">
              $1,212
            </Text>
          </VStack>
        </Flex>
      </Flex>
    </CardBox>
  );
};
