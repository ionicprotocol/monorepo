import { HStack, Text } from '@chakra-ui/react';
import type { NewPosition } from '@ionicprotocol/types';

import { TokenIcon } from '@ui/components/shared/TokenIcon';

export const CollateralAsset = ({ position }: { position: NewPosition }) => {
  return (
    <HStack>
      <TokenIcon address={position.collateral.underlyingToken} chainId={position.chainId} />
      <Text>{position.collateral.symbol}</Text>
    </HStack>
  );
};
