import { Button, Center, Divider, Flex, Text } from '@chakra-ui/react';

import { Banner } from '@ui/components/shared/Banner';
import { CardBox } from '@ui/components/shared/IonicBox';
import { useColors } from '@ui/hooks/useColors';

export const YourInfo = () => {
  const { cIPage } = useColors();

  return (
    <CardBox>
      <Flex direction={{ base: 'column' }}>
        <Text mb={{ base: '24px' }} size={'xl'}>
          Your Info
        </Text>
        <Flex direction={{ base: 'column' }} mb={{ base: '20px' }}>
          <Text color={'iLightGray'} textTransform={'uppercase'}>
            Wallet Balance
          </Text>
          <Text size={'lg'}>51,469.01 USDC</Text>
        </Flex>
        <Center height={5} mb={{ base: '20px' }}>
          <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
        </Center>
        <Flex alignItems={'center'} justifyContent={'space-between'} mb={{ base: '20px' }}>
          <Flex direction={{ base: 'column' }}>
            <Text color={'iLightGray'} textTransform={'uppercase'}>
              Available To Supply
            </Text>
            <Text size={'lg'}>51,469.01 USDC</Text>
            <Text color={'iGray'}>$51,462.58</Text>
          </Flex>
          <Button variant={'green'}>Supply</Button>
        </Flex>
        <Flex alignItems={'center'} justifyContent={'space-between'} mb={{ base: '20px' }}>
          <Flex direction={{ base: 'column' }}>
            <Text color={'iLightGray'} textTransform={'uppercase'}>
              Available To Borrow
            </Text>
            <Text size={'lg'}>0 USDC</Text>
            <Text color={'iGray'}>$0</Text>
          </Flex>
          <Button variant={'gray'}>Borrow</Button>
        </Flex>
        <Banner
          alertProps={{ variant: 'warning' }}
          descriptions={[
            {
              text: 'To borrow you need to supply any asset to be used as collateral',
              textProps: { size: 'md' }
            }
          ]}
        />
      </Flex>
    </CardBox>
  );
};
