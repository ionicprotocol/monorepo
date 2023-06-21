import { Text } from '@chakra-ui/react';
import type { OpenPosition } from '@midas-capital/types';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';

import { usePositionInfo } from '@ui/hooks/leverage/usePositionInfo';
import { usePositionsSupplyApy } from '@ui/hooks/leverage/usePositionsSupplyApy';

export const DebtRatio = ({ position }: { position: OpenPosition }) => {
  const supplyApyPerMarket = usePositionsSupplyApy([position.collateral], [position.chainId]);
  const { data: info } = usePositionInfo(
    position.address,
    supplyApyPerMarket
      ? utils.parseUnits(supplyApyPerMarket[position.collateral.cToken].totalApy.toString())
      : undefined,
    position.chainId
  );
  const [debtRatio, setDebtRatio] = useState<string>();

  useEffect(() => {
    if (info?.debtRatio) {
      setDebtRatio(utils.formatUnits(info.debtRatio));
    }
  }, [info?.debtRatio]);

  return info && debtRatio ? <Text>{debtRatio}</Text> : null;
};
