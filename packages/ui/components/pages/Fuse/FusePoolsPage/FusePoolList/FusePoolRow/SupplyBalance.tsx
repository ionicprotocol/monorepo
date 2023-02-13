import { Text } from '@chakra-ui/react';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { PoolData } from '@ui/types/TokensDataMap';

export const SupplyBalance = ({ pool }: { pool: PoolData }) => {
  const { address } = useMultiMidas();
  return (
    <>
      {!address ? (
        <SimpleTooltip label="Connect your wallet">
          <Text fontWeight="medium" size="sm" textAlign="center">
            -
          </Text>
        </SimpleTooltip>
      ) : (
        <BalanceCell
          primary={{
            value: pool.totalSupplyBalanceFiat,
          }}
        />
      )}
    </>
  );
};
