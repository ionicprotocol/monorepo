import { Text, VStack } from '@chakra-ui/react';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { FundedAsset } from '@ui/hooks/useAllFundedInfo';
import { useBorrowCap } from '@ui/hooks/useBorrowCap';
import { useTokenData } from '@ui/hooks/useTokenData';

export const TotalBorrow = ({ asset }: { asset: FundedAsset }) => {
  const poolChainId = Number(asset.chainId);
  const comptrollerAddress = asset.comptroller;
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  const { data: borrowCap } = useBorrowCap({
    comptroller: comptrollerAddress,
    market: asset,
    chainId: poolChainId,
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
