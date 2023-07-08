import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Flex, Text, VStack } from '@chakra-ui/react';

import { IonicBox } from '@ui/components/shared/IonicBox';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';

export const YourPerformance = () => {
  return (
    <IonicBox>
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
            <Text color={'iWhite'} fontSize="20px" fontWeight={600} lineHeight="30px">
              $2.33K
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
              Total borrowed
            </Text>
            <Text color={'iWhite'} fontSize="20px" fontWeight={600} lineHeight="30px">
              $1.23k
            </Text>
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
    </IonicBox>
  );
};
