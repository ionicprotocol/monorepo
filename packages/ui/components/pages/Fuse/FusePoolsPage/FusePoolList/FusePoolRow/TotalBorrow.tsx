import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { PoolData } from '@ui/types/TokensDataMap';

export const TotalBorrow = ({ pool }: { pool: PoolData }) => {
  return (
    <BalanceCell
      primary={{
        value: pool.totalBorrowedFiat,
      }}
    />
  );
};
