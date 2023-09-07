import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { useBorrowLimitTotal } from '@ui/hooks/useBorrowLimitTotal';
import type { PoolData } from '@ui/types/TokensDataMap';

export const Available = ({ pool }: { pool: PoolData }) => {
  const { assets, chainId: poolChainId, totalBorrowedFiat } = pool;
  const { data: borrowLimitTotal } = useBorrowLimitTotal(assets, poolChainId);

  return (
    <BalanceCell
      primary={{
        value: borrowLimitTotal ? borrowLimitTotal - totalBorrowedFiat : 0
      }}
    />
  );
};
