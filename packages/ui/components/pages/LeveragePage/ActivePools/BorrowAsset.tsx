import type { NewPosition } from '@ionicprotocol/types';

import { TokenIcon } from '@ui/components/shared/TokenIcon';

export const BorrowAsset = ({ position }: { position: NewPosition }) => {
  return <TokenIcon address={position.borrowable.underlyingToken} chainId={position.chainId} />;
};
