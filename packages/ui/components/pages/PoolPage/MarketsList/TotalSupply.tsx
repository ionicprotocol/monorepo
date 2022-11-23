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

export const TotalSupply = ({ asset, poolChainId }: { asset: MarketData; poolChainId: number }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const totalSupply = useMemo(() => {
    return Number(utils.formatUnits(asset.totalSupply, asset.underlyingDecimals));
  }, [asset.totalSupply, asset.underlyingDecimals]);

  const { cCard } = useColors();

  return (
    <VStack alignItems="flex-end">
      <SimpleTooltip label={`$${longFormat(asset.totalSupplyFiat)}`}>
        <Text color={cCard.txtColor} fontWeight="bold" variant="smText">
          {smallUsdFormatter(asset.totalSupplyFiat)}
          {asset.totalSupplyFiat > DOWN_LIMIT && asset.totalSupplyFiat < UP_LIMIT && '+'}
        </Text>
      </SimpleTooltip>
      <SimpleTooltip
        label={`${longFormat(totalSupply)} ${
          tokenData?.extraData?.shortName ?? tokenData?.symbol ?? asset.underlyingSymbol
        }`}
      >
        <Text
          className="totalSupply"
          mt={1}
          variant="smText"
          maxWidth="90px"
          textOverflow={'ellipsis'}
          align={'right'}
          whiteSpace="nowrap"
          overflow="hidden"
        >
          {tokenFormatter(asset.totalSupply, asset.underlyingDecimals)}
          {totalSupply > DOWN_LIMIT && totalSupply < UP_LIMIT && '+'}{' '}
          {tokenData?.extraData?.shortName ?? tokenData?.symbol ?? asset.underlyingSymbol}
        </Text>
      </SimpleTooltip>
    </VStack>
  );
};
