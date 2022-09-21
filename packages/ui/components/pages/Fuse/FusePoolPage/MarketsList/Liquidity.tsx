import { Box, Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import * as React from 'react';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { DOWN_LIMIT, UP_LIMIT } from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';
import { shortUsdFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';

export const Liquidity = ({ asset }: { asset: MarketData }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken);
  const { cCard } = useColors();

  return (
    <Box textAlign="end">
      <PopoverTooltip
        body={
          <>
            {asset.liquidityFiat > DOWN_LIMIT && asset.liquidityFiat < UP_LIMIT && (
              <>
                <div>{asset.liquidityFiat.toString()}</div>
                <br />
              </>
            )}
            <div>
              Liquidity is the amount of this asset that is available to borrow (unborrowed). To see
              how much has been supplied and borrowed in total, navigate to the Pool Info tab.
            </div>
          </>
        }
        placement="top-end"
      >
        <VStack alignItems={'flex-end'}>
          <Text color={cCard.txtColor} fontSize={{ base: '2.8vw', sm: 'lg' }}>
            {smallUsdFormatter(asset.liquidityFiat)}
            {asset.liquidityFiat > DOWN_LIMIT && asset.liquidityFiat < UP_LIMIT && '+'}
          </Text>
          <Text color={cCard.txtColor} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
            {shortUsdFormatter(
              Number(utils.formatUnits(asset.liquidity, asset.underlyingDecimals))
            ).replace('$', '')}{' '}
            {tokenData?.symbol}
          </Text>
        </VStack>
      </PopoverTooltip>
    </Box>
  );
};
