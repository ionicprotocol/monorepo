import { HStack, Text, useColorModeValue } from '@chakra-ui/react';
import type { PositionInfo } from '@midas-capital/types';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { smallFormatter } from '@ui/utils/bigUtils';

export const CurrentApy = ({ info }: { info?: PositionInfo }) => {
  const borrowApyColor = useColorModeValue('orange.500', 'orange');

  const currentApyNum = useMemo(() => {
    return info?.currentApy ? Number(utils.formatUnits(info.currentApy)) : null;
  }, [info?.currentApy]);

  return currentApyNum !== null ? (
    <HStack justifyContent="flex-end">
      <EllipsisText
        color={borrowApyColor}
        maxWidth="300px"
        tooltip={smallFormatter(currentApyNum, true, 18)}
      >
        {smallFormatter(currentApyNum)}%
      </EllipsisText>
    </HStack>
  ) : (
    <Text textAlign="right">-</Text>
  );
};
