import { Text } from '@chakra-ui/react';
import type { PositionInfo } from '@midas-capital/types';

export const SafetyBuffer = ({ info }: { info?: PositionInfo }) => {
  return info ? (
    <Text textAlign="right">{info.safetyBuffer}%</Text>
  ) : (
    <Text textAlign="right">-</Text>
  );
};
