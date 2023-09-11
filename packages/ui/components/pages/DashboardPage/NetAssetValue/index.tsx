import { Flex, Text } from '@chakra-ui/react';

import { CardBox } from '@ui/components/shared/IonicBox';

export const NetAssetValue = () => {
  return (
    <CardBox>
      <Flex direction={'column'}>
        <Flex direction={'row'} justifyContent={'space-between'} mb={'48px'}>
          <Text size={'xl'}>Net asset value</Text>
          <Text size={'xl'}>$11,157,39</Text>
        </Flex>
        <Flex direction={'row'} gap={'32px'}>
          <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
            <Text variant={'itemTitle'}>Total Collateral</Text>
            <Text size={'lg'} variant={'itemDesc'}>
              $233.31
            </Text>
          </Flex>
          <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
            <Text variant={'itemTitle'}>Total Borrowed</Text>
            <Text size={'lg'} variant={'itemDesc'}>
              $123.47
            </Text>
          </Flex>
          <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
            <Text variant={'itemTitle'}>Total Supply</Text>
            <Text size={'lg'} variant={'itemDesc'}>
              $10,924.08
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </CardBox>
  );
};
