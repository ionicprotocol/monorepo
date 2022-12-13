import { Text, VStack } from '@chakra-ui/react';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const Liquidity = ({ asset, poolChainId }: { asset: MarketData; poolChainId: number }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  return (
    <>
      {asset.isBorrowPaused ? (
        <VStack alignItems="flex-end">
          <SimpleTooltip label="This asset can not be borrowed.">
            <Text size="md" fontWeight="medium" textAlign="center">
              -
            </Text>
          </SimpleTooltip>
        </VStack>
      ) : (
        <BalanceCell
          primary={{
            value: asset.liquidityFiat,
          }}
          secondary={{
            value: asset.liquidity,
            symbol: tokenData?.symbol || '',
            decimals: asset.underlyingDecimals.toNumber(),
          }}
        />
      )}
    </>
  );
};
