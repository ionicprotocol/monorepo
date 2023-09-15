import type { NewPosition } from '@ionicprotocol/types';

import { TokenIcon } from '@ui/components/shared/TokenIcon';

export const CollateralAsset = ({ position }: { position: NewPosition }) => {
  return <TokenIcon address={position.collateral.underlyingToken} chainId={position.chainId} />;
};
