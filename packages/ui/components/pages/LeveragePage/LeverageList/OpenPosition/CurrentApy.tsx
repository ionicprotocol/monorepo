import { HStack, Spinner, Text, useColorModeValue } from '@chakra-ui/react';
import type { OpenPosition } from '@midas-capital/types';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { usePositionInfo } from '@ui/hooks/leverage/usePositionInfo';
import { usePositionsSupplyApy } from '@ui/hooks/leverage/usePositionsSupplyApy';
import { smallFormatter } from '@ui/utils/bigUtils';

export const CurrentApy = ({ position }: { position: OpenPosition }) => {
  const supplyApy = usePositionsSupplyApy([position.collateral], [position.chainId]);
  const { data: info, isLoading } = usePositionInfo(
    position.address,
    supplyApy
      ? utils.parseUnits(supplyApy[position.collateral.cToken].totalApy.toString())
      : undefined,
    position.chainId
  );
  const borrowApyColor = useColorModeValue('orange.500', 'orange');

  const currentApyNum = useMemo(() => {
    return info?.currentApy ? Number(utils.formatUnits(info.currentApy)) : null;
  }, [info?.currentApy]);

  return isLoading ? (
    <HStack justifyContent="flex-end">
      <Spinner />
    </HStack>
  ) : currentApyNum !== null ? (
    <HStack justifyContent="flex-end">
      <EllipsisText maxWidth="300px" tooltip={smallFormatter(currentApyNum, true, 18)}>
        <Text color={borrowApyColor}>{smallFormatter(currentApyNum)}%</Text>
      </EllipsisText>
    </HStack>
  ) : (
    <Text textAlign="right">-</Text>
  );
};
