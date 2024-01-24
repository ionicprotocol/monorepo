import { Text } from '@chakra-ui/react';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { PoolData } from '@ui/types/TokensDataMap';

export const SupplyBalance = ({ pool }: { pool: PoolData }) => {
  const { address } = useMultiIonic();
  return (
    <>
      {!address ? (
        <SimpleTooltip label="Connect your wallet">
          <Text size="md" textAlign="center">
            -
          </Text>
        </SimpleTooltip>
      ) : (
        <BalanceCell
          primary={{
            value: pool.totalSupplyBalanceFiat
          }}
        />
      )}
    </>
  );
};
