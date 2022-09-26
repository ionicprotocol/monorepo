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

export const SupplyBalance = ({ asset }: { asset: MarketData }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken);
  const supplyBalance = useMemo(() => {
    return Number(utils.formatUnits(asset.supplyBalance, asset.underlyingDecimals));
  }, [asset.supplyBalance, asset.underlyingDecimals]);

  const { cCard } = useColors();

  return (
    <VStack alignItems="flex-end">
      <SimpleTooltip label={`$${longFormat(asset.supplyBalanceFiat)}`}>
        <Text color={cCard.txtColor} fontWeight="bold" variant="smText">
          {smallUsdFormatter(asset.supplyBalanceFiat)}
          {asset.supplyBalanceFiat > DOWN_LIMIT && asset.supplyBalanceFiat < UP_LIMIT && '+'}
        </Text>
      </SimpleTooltip>
      <SimpleTooltip
        label={`${longFormat(supplyBalance)} ${
          tokenData?.extraData?.shortName ?? tokenData?.symbol ?? asset.underlyingSymbol
        }`}
      >
        <Text color={cCard.txtColor} mt={1} variant="smText">
          {tokenFormatter(asset.supplyBalance, asset.underlyingDecimals)}
          {supplyBalance > DOWN_LIMIT && supplyBalance < UP_LIMIT && '+'}{' '}
          {tokenData?.extraData?.shortName ?? tokenData?.symbol ?? asset.underlyingSymbol}
        </Text>
      </SimpleTooltip>
    </VStack>
  );
};
