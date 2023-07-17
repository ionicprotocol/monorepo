import { Text, VStack } from '@chakra-ui/react';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { useBorrowCap } from '@ui/hooks/useBorrowCap';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { MarketData } from '@ui/types/TokensDataMap';

export const TotalBorrow = ({
  asset,
  comptrollerAddress,
  poolChainId
}: {
  asset: MarketData;
  comptrollerAddress: string;
  poolChainId: number;
}) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  const { data: borrowCap } = useBorrowCap({
    chainId: poolChainId,
    comptroller: comptrollerAddress,
    market: asset
  });

  return (
    <>
      {asset.totalBorrow.isZero() && asset.isBorrowPaused ? (
        <VStack alignItems="flex-end">
          <Text fontWeight="medium" size="md" textAlign="center">
            -
          </Text>
        </VStack>
      ) : (
        <BalanceCell
          cap={borrowCap}
          primary={{
            value: asset.totalBorrowFiat
          }}
          secondary={{
            decimals: asset.underlyingDecimals.toNumber(),
            symbol: tokenData?.symbol || '',
            value: asset.totalBorrow
          }}
        />
      )}
    </>
  );
};
