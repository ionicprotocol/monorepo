import {
  Divider,
  Flex,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text
} from '@chakra-ui/react';
import type { LeveredPosition } from '@ionicprotocol/types';
import { useEffect, useState } from 'react';

import { Center } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import { useColors } from '@ui/hooks/useColors';

export const Info = ({ position }: { position: LeveredPosition }) => {
  const [healthFactor, setHealthFactor] = useState('');
  const { cIPage } = useColors();

  useEffect(() => {
    setHealthFactor('');
  }, []);

  console.warn(position);

  return (
    <CardBox>
      <Flex direction="column">
        <Text mb={'24px'} size={'xl'}>
          Information
        </Text>
        <Flex direction="column" gap={{ base: '4px' }}>
          <Flex justifyContent={'space-between'}>
            <Text variant={'itemTitle'}>Total Apr</Text>
            <Text variant={'itemDesc'}>8.94%</Text>
          </Flex>
          <Flex justifyContent={'space-between'}>
            <Text variant={'itemTitle'}>Position Value</Text>
            <HStack>
              <Text variant={'itemDesc'}>$0.00</Text>
              <Text variant={'itemDesc'}>➡</Text>
              <Text variant={'itemDesc'}>$11,109,240,278.27</Text>
            </HStack>
          </Flex>
          <Flex justifyContent={'space-between'}>
            <Text variant={'itemTitle'}>liquidation</Text>
            <HStack>
              <Text variant={'itemDesc'}>$0.00 (0%)</Text>
              <Text variant={'itemDesc'}>➡</Text>
              <Text variant={'itemDesc'}>$322,515.3 (100%)</Text>
            </HStack>
          </Flex>
          <Center height={'1px'} my={'20px'}>
            <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
          </Center>
          <Flex alignItems={'flex-start'} direction={{ base: 'column' }} gap={'8px'} mb={'10px'}>
            <Flex justifyContent={'space-between'} width={'100%'}>
              <Text color={'iLightGray'} textTransform="uppercase">
                Health Factor
              </Text>
              <Text color={'iWhite'} fontSize={healthFactor === '-1' ? '30px' : '20px'} size={'lg'}>
                {healthFactor === '-1' ? '∞' : healthFactor}
              </Text>
            </Flex>
            <Slider
              aria-label="slider-ex-1"
              max={Number(healthFactor)}
              min={0}
              mt={'20px'}
              value={Number(healthFactor)}
              variant="health"
            >
              <SliderMark
                color={'iWhite'}
                fontSize={healthFactor === '-1' ? '30px' : '16px'}
                value={Number(healthFactor)}
              >
                {healthFactor === '-1' ? '∞' : healthFactor}
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Flex>
          <Flex justifyContent={'space-between'}>
            <Text variant={'itemTitle'}>Health</Text>
            <HStack>
              <Text variant={'itemDesc'}>0.00</Text>
              <Text variant={'itemDesc'}>➡</Text>
              <Text variant={'itemDesc'}>34,445.63</Text>
            </HStack>
          </Flex>
          <Center height={'1px'} my={'20px'}>
            <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
          </Center>
        </Flex>
        <Flex justifyContent={'space-between'}>
          <Text variant={'itemTitle'}>Farm Apr</Text>
          <Text variant={'itemDesc'}>8.94%</Text>
        </Flex>
        <Flex justifyContent={'space-between'}>
          <Text variant={'itemTitle'}>Borrow Apr</Text>
          <Text variant={'itemDesc'}>-0.0%</Text>
        </Flex>
        <Flex justifyContent={'space-between'}>
          <Text variant={'itemTitle'}>Daily Apr</Text>
          <Text variant={'itemDesc'}>0.0245%</Text>
        </Flex>
        <Flex justifyContent={'space-between'}>
          <Text variant={'itemTitle'}>Debt Value</Text>
          <HStack>
            <Text variant={'itemDesc'}>$0.00</Text>
            <Text variant={'itemDesc'}>➡</Text>
            <Text variant={'itemDesc'}>$306,389.49</Text>
          </HStack>
        </Flex>
      </Flex>
    </CardBox>
  );
};
