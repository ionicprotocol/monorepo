import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react';

import type { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
interface BorrowsMarketProps {
  asset: MarketData;
  borrowLimitMarket?: number;
  updatedAsset?: MarketData;
  updatedBorrowLimitMarket?: number;
}

export const BorrowsMarket = ({
  asset,
  updatedAsset,
  borrowLimitMarket,
  updatedBorrowLimitMarket,
}: BorrowsMarketProps) => (
  <VStack alignItems={'flex-start'} spacing={0} width="100%">
    <Text flexShrink={0} size="sm">
      Borrowed in Market:
    </Text>
    <HStack justifyContent="flex-end" width="100%">
      <Text
        color={
          updatedAsset?.borrowBalanceFiat &&
          updatedBorrowLimitMarket &&
          updatedBorrowLimitMarket - updatedAsset.borrowBalanceFiat < -0.001
            ? 'fail'
            : undefined
        }
        textAlign="right"
        variant="tnumber"
      >
        {`${smallUsdFormatter(asset.borrowBalanceFiat)} of ${smallUsdFormatter(
          borrowLimitMarket || 0
        )}`}
      </Text>
      <Text>{'→'}</Text>
      {updatedAsset ? (
        <Text
          color={
            updatedAsset?.borrowBalanceFiat &&
            updatedBorrowLimitMarket &&
            updatedBorrowLimitMarket - updatedAsset.borrowBalanceFiat < -0.001
              ? 'fail'
              : undefined
          }
          textAlign="right"
          variant="tnumber"
        >
          {`${smallUsdFormatter(
            Math.max(updatedAsset.borrowBalanceFiat, 0)
          )} of ${smallUsdFormatter(updatedBorrowLimitMarket || 0)}`}
        </Text>
      ) : (
        <Skeleton display="inline">
          <Text textAlign="right">
            {`${smallUsdFormatter(asset.borrowBalanceFiat)} of ${smallUsdFormatter(
              borrowLimitMarket || 0
            )}`}
          </Text>
        </Skeleton>
      )}
    </HStack>
  </VStack>
);
