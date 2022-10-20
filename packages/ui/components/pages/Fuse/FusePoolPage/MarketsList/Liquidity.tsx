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
import { longFormat, midUsdFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';

export const Liquidity = ({ asset, poolChainId }: { asset: MarketData; poolChainId: number }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const liquidity = useMemo(() => {
    return Number(utils.formatUnits(asset.liquidity, asset.underlyingDecimals));
  }, [asset.liquidity, asset.underlyingDecimals]);
  const { cCard } = useColors();

  return (
    <Box textAlign="end">
      {asset.isBorrowPaused ? (
        <Text fontWeight="bold" variant="smText">
          -
        </Text>
      ) : (
        <VStack alignItems={'flex-end'}>
          <PopoverTooltip
            body={
              <>
                <div>${longFormat(asset.liquidityFiat)}</div>
                <br />
                <div>
                  Liquidity is the amount of this asset that is available to borrow (unborrowed). To
                  see how much has been supplied and borrowed in total, navigate to the Pool Info
                  tab.
                </div>
              </>
            }
          >
            <Text color={cCard.txtColor} fontWeight="bold" variant="smText">
              {smallUsdFormatter(asset.liquidityFiat)}
              {asset.liquidityFiat > DOWN_LIMIT && asset.liquidityFiat < UP_LIMIT && '+'}
            </Text>
          </PopoverTooltip>
          <SimpleTooltip
            label={`${longFormat(liquidity)} ${tokenData?.symbol ?? asset.underlyingSymbol}`}
          >
            <Text
              id="liquidity"
              mt={1}
              variant="smText"
              maxWidth={'90px'}
              textOverflow={'ellipsis'}
              align={'right'}
              whiteSpace="nowrap"
              overflow="hidden"
            >
              {midUsdFormatter(liquidity).replace('$', '')}
              {liquidity > DOWN_LIMIT && liquidity < UP_LIMIT && '+'}{' '}
              {tokenData?.symbol ?? asset.underlyingSymbol}
            </Text>
          </SimpleTooltip>
        </VStack>
      )}
    </Box>
  );
};
