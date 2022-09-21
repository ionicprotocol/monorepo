import { Text, useColorModeValue, VStack } from '@chakra-ui/react';
import * as React from 'react';
import { useMemo } from 'react';

import { useMidas } from '@ui/context/MidasContext';
import { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const BorrowApy = ({ asset }: { asset: MarketData }) => {
  const { currentChain, midasSdk } = useMidas();
  const borrowApyColor = useColorModeValue('orange.500', 'orange');
  const blocksPerMin = useMemo(
    () => getBlockTimePerMinuteByChainId(currentChain.id),
    [currentChain.id]
  );
  const borrowAPR = useMemo(
    () => midasSdk.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMin),
    [blocksPerMin, asset.borrowRatePerBlock, midasSdk]
  );

  return (
    <VStack alignItems={'flex-end'}>
      <Text color={borrowApyColor} fontSize={{ base: '2.8vw', sm: 'lg' }}>
        {borrowAPR.toFixed(3)}%
      </Text>
    </VStack>
  );
};
