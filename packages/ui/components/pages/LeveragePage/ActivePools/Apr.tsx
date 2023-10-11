import { Text } from '@chakra-ui/react';
import type { LeveredPosition } from '@ionicprotocol/types';

import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';

export const Apr = ({ position }: { position: LeveredPosition }) => {
  const { data: borrowApys } = useBorrowAPYs(
    [{ borrowRatePerBlock: position.borrowable.rate, cToken: position.borrowable.cToken }],
    position.chainId
  );

  return (
    <Text>{borrowApys ? (borrowApys[position.borrowable.cToken] * 100).toFixed(2) : '?'}%</Text>
  );
};
