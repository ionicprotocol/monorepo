import { Text, useColorModeValue, VStack } from '@chakra-ui/react';
import * as React from 'react';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const BorrowApy = ({ asset }: { asset: MarketData }) => {
  const { currentChain, currentSdk } = useMultiMidas();
  const borrowApyColor = useColorModeValue('orange.500', 'orange');
  const blocksPerMin = useMemo(() => {
    if (currentChain) return getBlockTimePerMinuteByChainId(currentChain.id);
  }, [currentChain]);
  const borrowAPR = useMemo(() => {
    if (currentSdk && blocksPerMin) {
      return currentSdk.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMin);
    }
  }, [blocksPerMin, asset.borrowRatePerBlock, currentSdk]);

  return (
    <VStack alignItems={'flex-end'}>
      <Text color={borrowApyColor} fontWeight="bold" variant="smText">
        {borrowAPR && borrowAPR.toFixed(3)}%
      </Text>
    </VStack>
  );
};
