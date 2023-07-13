import { Text } from '@chakra-ui/react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import type { CTokenToMaxBorrow } from '@ui/hooks/useMaxBorrowAmount';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Available = ({
  asset,
  maxBorrowAmounts,
}: {
  asset: MarketData;
  maxBorrowAmounts?: CTokenToMaxBorrow | null;
}) => {
  return (
    <SimpleTooltip label={maxBorrowAmounts ? maxBorrowAmounts[asset.cToken].number.toString() : ''}>
      <Text>{maxBorrowAmounts ? maxBorrowAmounts[asset.cToken].number.toFixed(4) : '-'}</Text>
    </SimpleTooltip>
  );
};
