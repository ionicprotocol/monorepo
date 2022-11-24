import { Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import * as React from 'react';
import { useMemo } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { DOWN_LIMIT, UP_LIMIT } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';
import { longFormat, smallUsdFormatter } from '@ui/utils/bigUtils';

export const BorrowBalance = ({
  asset,
  poolChainId,
}: {
  asset: MarketData;
  poolChainId: number;
}) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const borrowBalance = useMemo(() => {
    return Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals));
  }, [asset.borrowBalance, asset.underlyingDecimals]);
  const { cCard } = useColors();
  const { address } = useMultiMidas();

  return (
    <VStack alignItems={'flex-end'}>
      {address ? (
        <>
          <SimpleTooltip label={`$${longFormat(asset.borrowBalanceFiat)}`}>
            <Text color={cCard.txtColor} fontWeight="bold" variant="smText">
              {smallUsdFormatter(asset.borrowBalanceFiat)}
              {asset.borrowBalanceFiat > DOWN_LIMIT && asset.borrowBalanceFiat < UP_LIMIT && '+'}
            </Text>
          </SimpleTooltip>
          <SimpleTooltip
            label={`${longFormat(borrowBalance)} ${tokenData?.symbol ?? asset.underlyingSymbol}`}
          >
            <Text
              className="borrowBalance"
              mt={1}
              variant="smText"
              maxWidth={'90px'}
              textOverflow={'ellipsis'}
              align={'right'}
              whiteSpace="nowrap"
              overflow="hidden"
            >
              {smallUsdFormatter(borrowBalance).replace('$', '')}
              {borrowBalance > DOWN_LIMIT && borrowBalance < UP_LIMIT && '+'}{' '}
              {tokenData?.symbol ?? asset.underlyingSymbol}
            </Text>
          </SimpleTooltip>
        </>
      ) : (
        <SimpleTooltip label="Connect your wallet">
          <Text variant="smText" fontWeight="bold" textAlign="center">
            -
          </Text>
        </SimpleTooltip>
      )}
    </VStack>
  );
};
