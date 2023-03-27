import { Text, VStack } from '@chakra-ui/react';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { MarketData } from '@ui/types/TokensDataMap';

export const SupplyBalance = ({
  asset,
  poolChainId,
}: {
  asset: MarketData;
  poolChainId: number;
}) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  const { address } = useMultiMidas();
  return (
    <>
      {!address ? (
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
            value: asset.supplyBalanceFiat,
          }}
          secondary={{
            decimals: asset.underlyingDecimals.toNumber(),
            symbol: tokenData?.symbol || '',
            value: asset.supplyBalance,
          }}
        />
      )}
    </>
  );
};
