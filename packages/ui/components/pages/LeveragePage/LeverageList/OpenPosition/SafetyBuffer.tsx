import { Text } from '@chakra-ui/react';
import type { PositionInfo } from '@midas-capital/types';
import { utils } from 'ethers';

export const SafetyBuffer = ({ info }: { info?: PositionInfo }) => {
  return info ? (
    <Text textAlign="right">{Number(utils.formatUnits(info.safetyBuffer)).toFixed(2)}%</Text>
  ) : (
    <Text textAlign="right">-</Text>
  );
};
