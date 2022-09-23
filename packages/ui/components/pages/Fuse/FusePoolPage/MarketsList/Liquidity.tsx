import { Box, Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import * as React from 'react';
import { useMemo } from 'react';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { DOWN_LIMIT, UP_LIMIT } from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';
import { longFormat, shortUsdFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';

export const Liquidity = ({ asset }: { asset: MarketData }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken);
  const liquidity = useMemo(() => {
    return Number(utils.formatUnits(asset.liquidity, asset.underlyingDecimals));
  }, [asset.liquidity, asset.underlyingDecimals]);
  const { cCard } = useColors();

  return (
    <Box textAlign="end">
      <PopoverTooltip
        body={
          <>
            <div>${longFormat(asset.liquidityFiat)}</div>
            <br />
            <div>
              Liquidity is the amount of this asset that is available to borrow (unborrowed). To see
              how much has been supplied and borrowed in total, navigate to the Pool Info tab.
            </div>
          </>
        }
        placement="top-end"
      >
        <VStack alignItems={'flex-end'}>
          <Text color={cCard.txtColor} fontWeight="bold" fontSize={{ base: '2.8vw', sm: 'md' }}>
            {smallUsdFormatter(asset.liquidityFiat)}
            {asset.liquidityFiat > DOWN_LIMIT && asset.liquidityFiat < UP_LIMIT && '+'}
          </Text>
        </VStack>
      </PopoverTooltip>
      <SimpleTooltip
        label={`${longFormat(liquidity)} ${tokenData?.symbol ?? asset.underlyingSymbol}`}
      >
        <Text color={cCard.txtColor} mt={1} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
          {shortUsdFormatter(liquidity).replace('$', '')}
          {liquidity > DOWN_LIMIT && liquidity < UP_LIMIT && '+'}{' '}
          {tokenData?.symbol ?? asset.underlyingSymbol}
        </Text>
      </SimpleTooltip>
    </Box>
  );
};
