import { HStack, Text } from '@chakra-ui/react';
import type { NewPosition } from '@ionicprotocol/types';

import { TokenIcon } from '@ui/components/shared/TokenIcon';

export const BorrowAsset = ({ position }: { position: NewPosition }) => {
  return (
    <HStack>
      <TokenIcon address={position.borrowable.underlyingToken} chainId={position.chainId} />
      <Text>{position.borrowable.symbol}</Text>
    </HStack>
  );
};
