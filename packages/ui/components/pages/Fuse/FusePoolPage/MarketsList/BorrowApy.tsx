import { Text, VStack } from '@chakra-ui/react';
import * as React from 'react';

import { useMidas } from '@ui/context/MidasContext';
import { useColors } from '@ui/hooks/useColors';
import { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const BorrowApy = ({ asset }: { asset: MarketData }) => {
  const { currentChain, midasSdk } = useMidas();
  const blocksPerMin = getBlockTimePerMinuteByChainId(currentChain.id);
  const borrowAPR = midasSdk.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMin);
  const { cCard } = useColors();

  return (
    <VStack alignItems={'flex-end'}>
      <Text color={cCard.txtColor} fontSize={{ base: '2.8vw', sm: 'lg' }}>
        {borrowAPR.toFixed(3)}%
      </Text>
    </VStack>
  );
};
