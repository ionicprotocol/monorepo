import { Text } from '@chakra-ui/react';
import type { PositionInfo } from '@midas-capital/types';

export const LiquidationThreshold = ({ info }: { info?: PositionInfo }) => {
  return info ? (
    <Text textAlign="right">{info.liquidationThreshold}%</Text>
  ) : (
    <Text textAlign="right">-</Text>
  );
};
