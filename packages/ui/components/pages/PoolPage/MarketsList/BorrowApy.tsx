import { Text, useColorModeValue, VStack } from '@chakra-ui/react';
import * as React from 'react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const BorrowApy = ({
  asset,
  borrowApyPerAsset,
}: {
  asset: MarketData;
  borrowApyPerAsset: { [market: string]: number } | null | undefined;
}) => {
  const borrowApyColor = useColorModeValue('orange.500', 'orange');

  return (
    <VStack alignItems={'flex-end'}>
      {borrowApyPerAsset === null ||
      borrowApyPerAsset === undefined ||
      (asset.isBorrowPaused && asset.totalBorrow.isZero()) ? (
        <Text color={borrowApyColor} fontWeight="medium" size="sm" variant="tnumber">
          -
        </Text>
      ) : (
        <Text color={borrowApyColor} fontWeight="medium" size="sm" variant="tnumber">
          {(borrowApyPerAsset[asset.cToken] * 100).toFixed(2)}%
        </Text>
      )}
    </VStack>
  );
};
