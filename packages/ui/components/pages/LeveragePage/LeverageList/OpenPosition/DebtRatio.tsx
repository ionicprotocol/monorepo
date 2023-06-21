import { Text } from '@chakra-ui/react';
import type { PositionInfo } from '@midas-capital/types';

export const DebtRatio = ({ info }: { info?: PositionInfo }) => {
  return info ? <Text textAlign="right">{info.debtRatio}%</Text> : <Text textAlign="right">-</Text>;
};
