import { Text, VStack } from '@chakra-ui/react';

import { SimpleTooltip } from '../../../shared/SimpleTooltip';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

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
            <Text size="md" fontWeight="medium" textAlign="center">
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
            value: asset.supplyBalance,
            symbol: tokenData?.symbol || '',
            decimals: asset.underlyingDecimals.toNumber(),
          }}
        />
      )}
    </>
  );
};
