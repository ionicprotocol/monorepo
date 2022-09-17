import { Text, VStack } from '@chakra-ui/react';
import * as React from 'react';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { useColors } from '@ui/hooks/useColors';
import { MarketData } from '@ui/types/TokensDataMap';
import { shortUsdFormatter } from '@ui/utils/bigUtils';

export const Tvl = ({ asset }: { asset: MarketData }) => {
  const { cCard } = useColors();

  return (
    <VStack alignItems={'flex-end'}>
      <PopoverTooltip
        placement="top-start"
        body={
          "Total Value Lent (TVL) measures how much of this asset has been supplied in total. TVL does not account for how much of the lent assets have been borrowed, use 'liquidity' to determine the total unborrowed assets lent."
        }
      >
        <Text wordBreak={'keep-all'} color={cCard.txtColor} fontSize={{ base: '2.8vw', sm: 'lg' }}>
          {shortUsdFormatter(asset.totalSupplyFiat)}
        </Text>
      </PopoverTooltip>
    </VStack>
  );
};
