import { Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import * as React from 'react';
import { useMemo } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { DOWN_LIMIT, UP_LIMIT } from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';
import { longFormat, smallUsdFormatter } from '@ui/utils/bigUtils';

export const BorrowBalance = ({ asset }: { asset: MarketData }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken);
  const borrowBalance = useMemo(() => {
    return Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals));
  }, [asset.borrowBalance, asset.underlyingDecimals]);
  const { cCard } = useColors();

  return (
    <VStack alignItems={'flex-end'}>
      <SimpleTooltip label={`$${longFormat(asset.borrowBalanceFiat)}`}>
        <Text color={cCard.txtColor} fontWeight="bold" variant="smText">
          {smallUsdFormatter(asset.borrowBalanceFiat)}
          {asset.borrowBalanceFiat > DOWN_LIMIT && asset.borrowBalanceFiat < UP_LIMIT && '+'}
        </Text>
      </SimpleTooltip>
      <SimpleTooltip
        label={`${longFormat(borrowBalance)} ${tokenData?.symbol ?? asset.underlyingSymbol}`}
      >
        <Text color={cCard.txtColor} mt={1} variant="xsText">
          {smallUsdFormatter(borrowBalance).replace('$', '')}
          {borrowBalance > DOWN_LIMIT && borrowBalance < UP_LIMIT && '+'}{' '}
          {tokenData?.symbol ?? asset.underlyingSymbol}
        </Text>
      </SimpleTooltip>
    </VStack>
  );
};
