import { Box, Text } from '@chakra-ui/react';
import { utils } from 'ethers';
import * as React from 'react';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { useColors } from '@ui/hooks/useColors';
import { MarketData } from '@ui/types/TokensDataMap';

export const Ltv = ({ asset }: { asset: MarketData }) => {
  const { cCard } = useColors();

  return (
    <Box textAlign="end">
      <PopoverTooltip
        placement="top-start"
        body={
          'The Loan to Value (LTV) ratio defines the maximum amount of tokens in the pool that can be borrowed with a specific collateral. It’s expressed in percentage: if in a pool ETH has 75% LTV, for every 1 ETH worth of collateral, borrowers will be able to borrow 0.75 ETH worth of other tokens in the pool.'
        }
      >
        <Text color={cCard.txtColor} fontSize={{ base: '2.8vw', sm: 'lg' }}>
          {utils.formatUnits(asset.collateralFactor, 16)}%
        </Text>
      </PopoverTooltip>
    </Box>
  );
};
