import { Flex, Text } from '@chakra-ui/react';

import { CardBox } from '@ui/components/shared/IonicBox';

export const NetApr = () => {
  return (
    <CardBox>
      <Flex direction={'column'}>
        <Flex direction={'row'} justifyContent={'space-between'} mb={'48px'}>
          <Text size={'xl'}>Net APR</Text>
          <Text size={'xl'}>2.80%</Text>
        </Flex>
        <Flex direction={'row'} gap={'32px'}>
          <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
            <Text variant={'itemTitle'}>Evg.Collateral APR</Text>
            <Text size={'lg'} variant={'itemDesc'}>
              4.82%
            </Text>
          </Flex>
          <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
            <Text variant={'itemTitle'}>Evg.Borrowing APR</Text>
            <Text size={'lg'} variant={'itemDesc'}>
              4.10%
            </Text>
          </Flex>
          <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
            <Text variant={'itemTitle'}>Evg.Supply APR</Text>
            <Text size={'lg'} variant={'itemDesc'}>
              2.79%
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </CardBox>
  );
};
