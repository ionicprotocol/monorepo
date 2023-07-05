import { Flex, Text, VStack } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export const Platform = () => {
  const { cICard } = useColors();

  return (
    <Flex
      bg={cICard.bgColor}
      borderRadius="24px"
      direction="column"
      gap="20px"
      px={{ base: '32px' }}
      py={{ base: '20px' }}
    >
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
          <Text color={'iWhite'} fontSize="20px" fontWeight={600} lineHeight="30px">
            $295.41M
          </Text>
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
  );
};
