import { Text, VStack } from '@chakra-ui/react';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { MarketData } from '@ui/types/TokensDataMap';

export const YourBalance = ({ asset, chainId }: { asset: MarketData; chainId: number }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, chainId);
  const { address } = useMultiIonic();

  return (
    <>
      {!address || (asset.borrowBalance.isZero() && asset.isBorrowPaused) ? (
        <VStack alignItems="flex-end">
          <SimpleTooltip isDisabled={!!address} label="Connect your wallet">
            <Text textAlign="center">-</Text>
          </SimpleTooltip>
        </VStack>
      ) : (
        <BalanceCell
          primary={{
            value: asset.borrowBalanceFiat
          }}
          secondary={{
            decimals: asset.underlyingDecimals.toNumber(),
            symbol: tokenData?.symbol || '',
            value: asset.borrowBalance
          }}
        />
      )}
    </>
  );
};
