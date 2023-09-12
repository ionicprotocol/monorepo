import { BalanceCell } from '@ui/components/shared/BalanceCell';
import type { PoolData } from '@ui/types/TokensDataMap';

export const Liquidity = ({ pool }: { pool: PoolData }) => {
  return (
    <BalanceCell
      primary={{
        value: pool.totalLiquidityFiat
      }}
    />
  );
};
