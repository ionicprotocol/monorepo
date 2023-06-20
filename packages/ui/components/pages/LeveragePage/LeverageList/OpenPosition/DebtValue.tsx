import type { OpenPosition } from '@midas-capital/types';
import type { BigNumber } from 'ethers';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';

import { SupplyBalance as MarketSupplyBalance } from '@ui/components/pages/PoolPage/MarketsList/SupplyBalance';
import { usePositionInfo } from '@ui/hooks/leverage/usePositionInfo';
import { usePositionSupplyApy } from '@ui/hooks/leverage/usePositionsSupplyApy';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';

export const DebtValue = ({ position }: { position: OpenPosition }) => {
  const { data: usdPrice } = useUsdPrice(position.chainId.toString());
  const supplyApyPerMarket = usePositionSupplyApy(position.collateral, position.chainId);
  const { data: info } = usePositionInfo(
    position.address,
    supplyApyPerMarket
      ? utils.parseUnits(supplyApyPerMarket[position.collateral.cToken].totalApy.toString())
      : undefined,
    position.chainId
  );
  const [supplyBalance, setSupplyBalance] = useState<BigNumber>();

  useEffect(() => {
    if (info?.debtValue) {
      setSupplyBalance(
        info.debtValue
          .mul(utils.parseUnits('1', Number(position.collateral.underlyingDecimals) + 18))
          .div(position.collateral.underlyingPrice)
      );
    }
  }, [
    info?.debtValue,
    position.collateral.underlyingDecimals,
    position.collateral.underlyingPrice,
  ]);

  return info && supplyBalance ? (
    <MarketSupplyBalance
      asset={{
        supplyBalance,
        supplyBalanceFiat: usdPrice ? Number(utils.formatUnits(info.debtValue)) * usdPrice : 0,
        underlyingDecimals: position.collateral.underlyingDecimals,
        underlyingToken: position.collateral.underlyingToken,
      }}
      poolChainId={position.chainId}
    />
  ) : null;
};
