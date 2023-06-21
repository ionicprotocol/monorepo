import { Text } from '@chakra-ui/react';
import type { OpenPosition } from '@midas-capital/types';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';

import { usePositionInfo } from '@ui/hooks/leverage/usePositionInfo';
import { usePositionsSupplyApy } from '@ui/hooks/leverage/usePositionsSupplyApy';

export const LiquidationThreshold = ({ position }: { position: OpenPosition }) => {
  const supplyApyPerMarket = usePositionsSupplyApy([position.collateral], [position.chainId]);
  const { data: info } = usePositionInfo(
    position.address,
    supplyApyPerMarket
      ? utils.parseUnits(supplyApyPerMarket[position.collateral.cToken].totalApy.toString())
      : undefined,
    position.chainId
  );
  const [liquidationThreshold, setLiquidationThreshold] = useState<string>();

  useEffect(() => {
    if (info?.liquidationThreshold) {
      setLiquidationThreshold(utils.formatUnits(info?.liquidationThreshold));
    }
  }, [info?.liquidationThreshold]);

  return info && liquidationThreshold ? <Text>{liquidationThreshold}</Text> : null;
};
