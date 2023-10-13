import { Text } from '@chakra-ui/react';
import type { LeveredPosition } from '@ionicprotocol/types';

export const YourPosition = ({ position }: { position: LeveredPosition }) => {
  console.warn(position.collateral);

  return <Text>--</Text>;
};
