import { HStack, Text } from '@chakra-ui/react';
import type { LeveredPosition } from '@ionicprotocol/types';

import { TokenIcon } from '@ui/components/shared/TokenIcon';

export const BorrowAsset = ({ position }: { position: LeveredPosition }) => {
  return (
    <HStack>
      <TokenIcon address={position.borrowable.underlyingToken} chainId={position.chainId} />
      <Text>{position.borrowable.symbol}</Text>
    </HStack>
  );
};
