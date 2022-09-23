import { Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import * as React from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { DOWN_LIMIT, UP_LIMIT } from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

export const BorrowBalance = ({ asset }: { asset: MarketData }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken);
  const { cCard } = useColors();

  return (
    <VStack alignItems={'flex-end'}>
      <SimpleTooltip
        label={asset.borrowBalanceFiat.toString()}
        isDisabled={asset.borrowBalanceFiat === DOWN_LIMIT || asset.borrowBalanceFiat >= UP_LIMIT}
      >
        <Text color={cCard.txtColor} fontWeight="bold" fontSize={{ base: '2.8vw', sm: 'md' }}>
          {smallUsdFormatter(asset.borrowBalanceFiat)}
          {asset.borrowBalanceFiat > DOWN_LIMIT && asset.borrowBalanceFiat < UP_LIMIT && '+'}
        </Text>
      </SimpleTooltip>
      <SimpleTooltip
        label={utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)}
        isDisabled={
          Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)) === DOWN_LIMIT ||
          Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)) >= UP_LIMIT
        }
      >
        <Text color={cCard.txtColor} mt={1} fontSize={{ base: '2.8vw', sm: '0.8rem' }}>
          {smallUsdFormatter(
            Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals))
          ).replace('$', '')}
          {Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)) > DOWN_LIMIT &&
            Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)) < UP_LIMIT &&
            '+'}{' '}
          {tokenData?.symbol ?? asset.underlyingSymbol}
        </Text>
      </SimpleTooltip>
    </VStack>
  );
};
