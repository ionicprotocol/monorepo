import { Text, useColorModeValue, VStack } from '@chakra-ui/react';
import * as React from 'react';
import { useMemo } from 'react';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const BorrowApy = ({ asset, poolChainId }: { asset: MarketData; poolChainId: number }) => {
  const sdk = useSdk(poolChainId);
  const borrowApyColor = useColorModeValue('orange.500', 'orange');

  const borrowAPR = useMemo(() => {
    if (sdk) {
      const blocksPerMin = getBlockTimePerMinuteByChainId(sdk.chainId);

      return sdk.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMin);
    }
  }, [asset.borrowRatePerBlock, sdk]);

  return (
    <VStack alignItems={'flex-end'}>
      {borrowAPR === undefined || (asset.isBorrowPaused && asset.totalBorrow.isZero()) ? (
        <Text color={borrowApyColor} fontWeight="medium" size="sm" variant="tnumber">
          -
        </Text>
      ) : (
        <Text color={borrowApyColor} fontWeight="medium" size="sm" variant="tnumber">
          {borrowAPR.toFixed(3)}%
        </Text>
      )}
    </VStack>
  );
};
