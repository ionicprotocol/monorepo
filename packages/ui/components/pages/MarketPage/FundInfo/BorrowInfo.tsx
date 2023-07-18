import {
  Center,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Flex,
  Icon,
  Text
} from '@chakra-ui/react';
import { BsCheckCircle } from 'react-icons/bs';

import { useColors } from '@ui/hooks/useColors';

export const BorrowInfo = () => {
  const { cIPage } = useColors();

  return (
    <Flex>
      <Flex width={'100%'}>
        <Flex width={'100%'}>
          <Flex flex={1} gap={{ base: '32px' }}>
            <CircularProgress
              color={'iGreen'}
              height={'74px'}
              size="74px"
              thickness="12px"
              trackColor={'iGray'}
              value={12.1}
            >
              <CircularProgressLabel fontSize={'12px'}>12.10%</CircularProgressLabel>
            </CircularProgress>
            <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
              <Text color={'iLightGray'} textTransform={'uppercase'}>
                Total Supplied
              </Text>
              <Text size={'lg'}>213.04M of 1.76B</Text>
              <Text color={'iGray'}>$213.00M of $1.76B</Text>
            </Flex>
            <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
              <Text color={'iLightGray'} textTransform={'uppercase'}>
                APR
              </Text>
              <Text size={'lg'}>2.50%</Text>
            </Flex>
          </Flex>
          <Center height={'100%'} mx={{ base: '24px' }}>
            <Divider bg={cIPage.dividerColor} orientation="vertical" width="1px" />
          </Center>
          <Flex flex={1} gap={{ base: '32px' }}>
            <Flex
              alignItems={'center'}
              direction={{ base: 'column' }}
              justifyContent={{ base: 'space-between' }}
            >
              <Icon as={BsCheckCircle} color={'iGreen'} fontSize="50px" />
              <Text>Can be collateral</Text>
            </Flex>
            <Flex direction={{ base: 'column' }} flex={1} gap={{ base: '8px' }}>
              <Flex justifyContent={'space-between'}>
                <Text color={'iLightGray'} textTransform={'uppercase'}>
                  Max LTV
                </Text>
                <Text>77.00%</Text>
              </Flex>
              <Flex justifyContent={'space-between'}>
                <Text color={'iLightGray'} textTransform={'uppercase'}>
                  Liquidation Thershold
                </Text>
                <Text>79.00%</Text>
              </Flex>
              <Flex justifyContent={'space-between'}>
                <Text color={'iLightGray'} textTransform={'uppercase'}>
                  Liquidation Penalty
                </Text>
                <Text>4.50%</Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
