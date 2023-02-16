import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react';

import { smallUsdFormatter } from '@ui/utils/bigUtils';

interface BorrowsTotalProps {
  borrowLimitTotal?: number;
  totalBorrows: number;
  updatedBorrowLimitTotal?: number;
  updatedTotalBorrows?: number;
}

export const BorrowsTotal = ({
  borrowLimitTotal,
  totalBorrows,
  updatedBorrowLimitTotal,
  updatedTotalBorrows,
}: BorrowsTotalProps) => (
  <VStack alignItems={'flex-start'} spacing={0} width="100%">
    <Text flexShrink={0} size="sm">
      Borrowed in Total:
    </Text>
    <HStack justifyContent="flex-end" width="100%">
      <Text
        color={
          updatedTotalBorrows !== undefined &&
          updatedBorrowLimitTotal &&
          updatedTotalBorrows / updatedBorrowLimitTotal >= 0.8
            ? updatedTotalBorrows / updatedBorrowLimitTotal >= 0.95
              ? 'fail'
              : 'warn'
            : undefined
        }
        textAlign="right"
        variant="tnumber"
      >
        {`${smallUsdFormatter(totalBorrows)} of ${smallUsdFormatter(borrowLimitTotal || 0)}`}
      </Text>
      <Text>{'→'}</Text>
      {updatedTotalBorrows !== undefined ? (
        <Text
          color={
            updatedTotalBorrows !== undefined &&
            updatedBorrowLimitTotal &&
            updatedTotalBorrows / updatedBorrowLimitTotal >= 0.8
              ? updatedTotalBorrows / updatedBorrowLimitTotal >= 0.95
                ? 'fail'
                : 'warn'
              : undefined
          }
          textAlign="right"
          variant="tnumber"
        >
          {`${smallUsdFormatter(Math.max(updatedTotalBorrows, 0))} of ${smallUsdFormatter(
            updatedBorrowLimitTotal || 0
          )}`}
        </Text>
      ) : (
        <Skeleton display="inline">
          <Text textAlign="right" variant="tnumber">
            {`${smallUsdFormatter(totalBorrows)} of ${smallUsdFormatter(borrowLimitTotal || 0)}`}
          </Text>
        </Skeleton>
      )}
    </HStack>
  </VStack>
);
