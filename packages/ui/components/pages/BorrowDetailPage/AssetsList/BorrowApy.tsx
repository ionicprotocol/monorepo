import { Text, VStack } from '@chakra-ui/react';
import * as React from 'react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const BorrowApy = ({
  asset,
  borrowApys
}: {
  asset: MarketData;
  borrowApys: { [market: string]: number } | null | undefined;
}) => {
  return (
    <VStack alignItems={'flex-start'}>
      {borrowApys === null ||
      borrowApys === undefined ||
      (asset.isBorrowPaused && asset.totalBorrow.isZero()) ? (
        <Text>-</Text>
      ) : (
        <Text>{(borrowApys[asset.cToken] * 100).toFixed(2)}%</Text>
      )}
    </VStack>
  );
};
