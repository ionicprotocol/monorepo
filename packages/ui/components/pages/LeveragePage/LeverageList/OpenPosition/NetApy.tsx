import { HStack, Text, useColorModeValue } from '@chakra-ui/react';
import type { PositionInfo } from '@midas-capital/types';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { smallFormatter } from '@ui/utils/bigUtils';

export const NetApy = ({ info }: { info?: PositionInfo }) => {
  const borrowApyColor = useColorModeValue('orange.500', 'orange');

  const netApyNum = useMemo(() => {
    return info?.currentApy ? Number(utils.formatUnits(info.currentApy)) : null;
  }, [info?.currentApy]);

  return netApyNum !== null ? (
    <HStack justifyContent="flex-end">
      <EllipsisText
        color={borrowApyColor}
        maxWidth="300px"
        tooltip={smallFormatter(netApyNum * 100, true, 18)}
      >
        {smallFormatter(netApyNum * 100)}%
      </EllipsisText>
    </HStack>
  ) : (
    <Text textAlign="right">-</Text>
  );
};
