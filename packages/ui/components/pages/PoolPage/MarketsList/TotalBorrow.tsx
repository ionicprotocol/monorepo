import { Text, VStack } from '@chakra-ui/react';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const TotalBorrow = ({ asset, poolChainId }: { asset: MarketData; poolChainId: number }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  return (
    <>
      {asset.totalBorrow.isZero() && asset.isBorrowPaused ? (
        <VStack alignItems="flex-end">
          <Text size="md" fontWeight="medium" textAlign="center">
            -
          </Text>
        </VStack>
      ) : (
        <BalanceCell
          primary={{
            value: asset.totalBorrowFiat,
          }}
          secondary={{
            value: asset.totalBorrow,
            symbol: tokenData?.symbol || '',
            decimals: asset.underlyingDecimals.toNumber(),
          }}
        />
      )}
    </>
  );
};
