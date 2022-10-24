import { Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import * as React from 'react';
import { useMemo } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { DOWN_LIMIT, UP_LIMIT } from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';
import { longFormat, smallUsdFormatter, tokenFormatter } from '@ui/utils/bigUtils';

export const TotalBorrow = ({ asset, poolChainId }: { asset: MarketData; poolChainId: number }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const totalBorrow = useMemo(() => {
    return Number(utils.formatUnits(asset.totalBorrow, asset.underlyingDecimals));
  }, [asset.totalBorrow, asset.underlyingDecimals]);

  const { cCard } = useColors();

  return (
    <VStack alignItems="flex-end">
      <SimpleTooltip label={`$${longFormat(asset.totalBorrowFiat)}`}>
        <Text color={cCard.txtColor} fontWeight="bold" variant="smText">
          {smallUsdFormatter(asset.totalBorrowFiat)}
          {asset.totalBorrowFiat > DOWN_LIMIT && asset.totalBorrowFiat < UP_LIMIT && '+'}
        </Text>
      </SimpleTooltip>
      <SimpleTooltip
        label={`${longFormat(totalBorrow)} ${
          tokenData?.extraData?.shortName ?? tokenData?.symbol ?? asset.underlyingSymbol
        }`}
      >
        <Text
          className="totalBorrow"
          mt={1}
          variant="smText"
          maxWidth="90px"
          textOverflow={'ellipsis'}
          align={'right'}
          whiteSpace="nowrap"
          overflow="hidden"
        >
          {tokenFormatter(asset.totalBorrow, asset.underlyingDecimals)}
          {totalBorrow > DOWN_LIMIT && totalBorrow < UP_LIMIT && '+'}{' '}
          {tokenData?.extraData?.shortName ?? tokenData?.symbol ?? asset.underlyingSymbol}
        </Text>
      </SimpleTooltip>
    </VStack>
  );
};
