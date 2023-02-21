import { Text, VStack } from '@chakra-ui/react';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { FundedAsset } from '@ui/hooks/useAllFundedInfo';
import { useTokenData } from '@ui/hooks/useTokenData';

export const BorrowBalance = ({ asset }: { asset: FundedAsset }) => {
  const poolChainId = Number(asset.chainId);
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const { address } = useMultiMidas();

  return (
    <>
      {!address || (asset.borrowBalance.isZero() && asset.isBorrowPaused) ? (
        <VStack alignItems="flex-end">
          <SimpleTooltip label="Connect your wallet">
            <Text fontWeight="medium" size="md" textAlign="center">
              -
            </Text>
          </SimpleTooltip>
        </VStack>
      ) : (
        <BalanceCell
          primary={{
            value: asset.borrowBalanceFiat,
          }}
          secondary={{
            value: asset.borrowBalance,
            symbol: tokenData?.symbol || '',
            decimals: asset.underlyingDecimals.toNumber(),
          }}
        />
      )}
    </>
  );
};
