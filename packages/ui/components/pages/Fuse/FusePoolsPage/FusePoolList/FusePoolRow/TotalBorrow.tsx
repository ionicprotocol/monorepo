import { Text, VStack } from '@chakra-ui/react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { PoolData } from '@ui/types/TokensDataMap';
import { longFormat, smallUsdFormatter } from '@ui/utils/bigUtils';

export const TotalBorrow = ({ pool }: { pool: PoolData }) => {
  return (
    <VStack alignItems={'flex-end'} px={{ base: 2, lg: 4 }} justifyContent="center" height="100%">
      <SimpleTooltip label={`$${longFormat(pool.totalBorrowedFiat)}`}>
        <Text variant="smText" fontWeight="bold" textAlign="center">
          {smallUsdFormatter(pool.totalBorrowedFiat)}
          {pool.totalBorrowedFiat > 0 && pool.totalBorrowedFiat < 0.01 && '+'}
        </Text>
      </SimpleTooltip>
    </VStack>
  );
};
