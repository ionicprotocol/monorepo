import { Text } from '@chakra-ui/react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const UtilizationRate = ({ asset }: { asset: MarketData }) => {
  return <Text>{(asset.utilization * 100).toFixed(2)}%</Text>;
};
