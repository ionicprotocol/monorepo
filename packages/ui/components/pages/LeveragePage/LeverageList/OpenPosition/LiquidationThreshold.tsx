import { Text } from '@chakra-ui/react';
import type { PositionInfo } from '@midas-capital/types';
import { utils } from 'ethers';

export const LiquidationThreshold = ({ info }: { info?: PositionInfo }) => {
  return info ? (
    <Text textAlign="right">
      {(Number(utils.formatUnits(info.liquidationThreshold)) * 100).toFixed(2)}%
    </Text>
  ) : (
    <Text textAlign="right">-</Text>
  );
};
