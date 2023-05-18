import { HStack, VStack } from '@chakra-ui/react';
import type { LeveredPosition } from '@midas-capital/types';

export const BorrowableAsset = ({ leverage }: { leverage: LeveredPosition }) => {
  return (
    <HStack justifyContent="flex-end">
      <VStack alignItems={'flex-end'} spacing={0.5}>
        {leverage.borrowable.map((asset) => asset.symbol)}
      </VStack>
    </HStack>
  );
};
