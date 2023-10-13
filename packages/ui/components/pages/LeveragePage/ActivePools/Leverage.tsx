import { Text } from '@chakra-ui/react';
import type { LeveredPosition } from '@ionicprotocol/types';

export const Leverage = ({ position }: { position: LeveredPosition }) => {
  console.warn(position.collateral);

  return <Text variant="tnumber">10x</Text>;
};
