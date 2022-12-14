import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { PoolData } from '@ui/types/TokensDataMap';

export const TotalSupply = ({ pool }: { pool: PoolData }) => {
  return (
    <BalanceCell
      primary={{
        value: pool.totalSuppliedFiat,
      }}
    />
  );
};
