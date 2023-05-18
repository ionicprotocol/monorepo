import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Input,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { LeveredPosition } from '@midas-capital/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import type { Row } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useSwitchNetwork } from 'wagmi';

import { BorrowableAssets } from '../BorrowableAssets';

import type { LeverageRowData } from '@ui/components/pages/LeveragePage/LeverageList/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useWindowSize } from '@ui/hooks/useScreenSize';
import { getChainConfig } from '@ui/utils/networkData';

export interface ComptrollerToPool {
  [comptroller: string]: { allocation: number; chainId: number; poolId: number; poolName: string };
}

export const AdditionalInfo = ({ row }: { row: Row<LeverageRowData> }) => {
  const leverage: LeveredPosition = row.original.collateralAsset;

  const chainId = Number(leverage.chainId);
  const [chainConfig] = useMemo(() => [getChainConfig(chainId)], [chainId]);
  const [sliderValue, setSliderValue] = useState(0);
  const { currentChain } = useMultiMidas();
  const windowWidth = useWindowSize();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { switchNetworkAsync } = useSwitchNetwork();

  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else if (openChainModal) {
      openChainModal();
    }
  };

  const { cSlider } = useColors();

  return (
    <Box minWidth="400px" width={{ base: windowWidth.width * 0.9, md: 'auto' }}>
      <Flex
        alignItems="center"
        flexDirection={{ base: 'column', lg: 'row' }}
        gap={4}
        justifyContent="flex-end"
      >
        {!currentChain ? (
          <Box>
            <Button onClick={openConnectModal} variant="_solid">
              Connect Wallet
            </Button>
          </Box>
        ) : currentChain.unsupported || currentChain.id !== Number(leverage.chainId) ? (
          <Box>
            <Button onClick={handleSwitch} variant="_solid">
              Switch {chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
            </Button>
          </Box>
        ) : (
          <HStack>{/*  */}</HStack>
        )}
      </Flex>
      <Flex justifyContent="center" width="100%">
        <Grid
          alignItems="stretch"
          gap={4}
          maxW="1200px"
          minW="400px"
          templateColumns={{
            base: 'repeat(1, 1fr)',
            lg: 'repeat(7, 1fr)',
            md: 'repeat(1, 1fr)',
          }}
        >
          <GridItem colSpan={{ base: 1, lg: 5, md: 1 }}>
            <Grid
              alignItems="stretch"
              gap={8}
              templateColumns={{
                base: 'repeat(1, 1fr)',
                lg: 'repeat(5, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
              w="100%"
            >
              <GridItem colSpan={{ base: 1, lg: 2, md: 1 }}>
                <VStack alignItems="flex-start" spacing={4}>
                  <Text size="md">Supply</Text>
                  <VStack alignItems="flex-start" spacing={0}>
                    <Text>Available: xx</Text>
                    <Input height={12} width="230px" />
                  </VStack>
                </VStack>
              </GridItem>
              <GridItem colSpan={{ base: 1, lg: 2, md: 1 }}>
                <VStack alignItems="flex-start" height="100%" justifyContent="space-between">
                  <Text size="md">Borrow</Text>
                  <VStack>
                    <BorrowableAssets leverage={leverage} />
                  </VStack>
                </VStack>
              </GridItem>
              <GridItem colSpan={{ base: 1, lg: 1, md: 2 }}>
                <VStack alignItems="flex-start" height="100%" justifyContent="flex-end">
                  <Button height={12}>Leverage</Button>
                </VStack>
              </GridItem>
              <GridItem colSpan={{ base: 1, lg: 4, md: 2 }}>
                <VStack alignItems="flex-start" height={20} spacing={4}>
                  <Text size="md">Leverage</Text>
                  <Slider
                    aria-label="slider"
                    max={3}
                    min={1}
                    onChange={(val) => setSliderValue(val)}
                    step={0.5}
                    value={sliderValue}
                  >
                    <SliderMark fontSize="md" mt={4} value={1}>
                      1.0
                    </SliderMark>
                    <SliderMark fontSize="md" mt={4} value={1.5}>
                      1.5
                    </SliderMark>
                    <SliderMark fontSize="md" ml={-1} mt={4} value={2}>
                      2.0
                    </SliderMark>
                    <SliderMark fontSize="md" ml={-1} mt={4} value={2.5}>
                      2.5
                    </SliderMark>
                    <SliderMark fontSize="md" ml={-1} mt={4} value={3}>
                      3.0
                    </SliderMark>
                    <SliderTrack backgroundColor={cSlider.trackBgColor} height={1.5}>
                      <SliderFilledTrack backgroundColor={cSlider.filledTrackBgColor} />
                    </SliderTrack>
                    <SliderThumb
                      bgColor={cSlider.thumbBgColor}
                      borderColor={cSlider.thumbBorderColor}
                      borderWidth={2}
                      boxSize={4}
                    />
                  </Slider>
                </VStack>
              </GridItem>
            </Grid>
          </GridItem>
          <GridItem colSpan={{ base: 1, lg: 2, md: 1 }}>
            <Flex height="100%" justifyContent="center">
              <VStack alignItems="flex-start" height="100%" justifyContent="center" spacing={4}>
                <HStack spacing={4}>
                  <HStack justifyContent="flex-end" width="90px">
                    <Text size="md">Yield</Text>
                  </HStack>
                  <HStack>
                    <Text>20%</Text>
                    <Text>➡</Text>
                    <Text>50%</Text>
                  </HStack>
                </HStack>
                <HStack spacing={4}>
                  <HStack justifyContent="flex-end" width="90px">
                    <Text size="md">Borrow</Text>
                  </HStack>
                  <HStack>
                    <Text>20%</Text>
                    <Text>➡</Text>
                    <Text>50%</Text>
                  </HStack>
                </HStack>
                <HStack spacing={4}>
                  <HStack justifyContent="flex-end" width="90px">
                    <Text size="md">Total APR</Text>
                  </HStack>
                  <HStack>
                    <Text>20%</Text>
                  </HStack>
                </HStack>
              </VStack>
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
    </Box>
  );
};
