import { Text, VStack } from '@chakra-ui/react';
import * as React from 'react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const Apr = ({
  asset,
  borrowApyPerAsset
}: {
  asset: MarketData;
  borrowApyPerAsset: { [market: string]: number } | null | undefined;
}) => {
  return (
    <VStack alignItems={'flex-end'}>
      {borrowApyPerAsset === null ||
      borrowApyPerAsset === undefined ||
      (asset.isBorrowPaused && asset.totalBorrow.isZero()) ? (
        <Text>-</Text>
      ) : (
        <Text>{(borrowApyPerAsset[asset.cToken] * 100).toFixed(2)}%</Text>
      )}
    </VStack>
  );
};
