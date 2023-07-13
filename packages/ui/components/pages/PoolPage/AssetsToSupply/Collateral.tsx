import { ChevronDownIcon } from '@chakra-ui/icons';

import type { MarketData } from '@ui/types/TokensDataMap';

export const Collateral = ({ asset }: { asset: MarketData }) => {
  return asset.membership ? <ChevronDownIcon color={'iGreen'} /> : null;
};
