import type { OpenPosition } from '@midas-capital/types';
import { utils } from 'ethers';

import { SupplyBalance as MarketSupplyBalance } from '@ui/components/pages/PoolPage/MarketsList/SupplyBalance';
import { usePositionInfo } from '@ui/hooks/leverage/usePositionInfo';
import { usePositionSupplyApy } from '@ui/hooks/leverage/usePositioniSupplyApy';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';

export const PositionValue = ({ position }: { position: OpenPosition }) => {
  const { data: usdPrice } = useUsdPrice(position.chainId.toString());
  const supplyApyPerMarket = usePositionSupplyApy(position.collateral, position.chainId);
  const { data: info } = usePositionInfo(
    position.address,
    supplyApyPerMarket
      ? utils.parseUnits(supplyApyPerMarket[position.collateral.cToken].totalApy.toString())
      : undefined,
    position.chainId
  );

  console.warn(info);

  return (
    <MarketSupplyBalance
      asset={{
        supplyBalance: position.collateral.totalSupplied,
        supplyBalanceFiat: usdPrice
          ? Number(
              utils.formatUnits(
                position.collateral.totalSupplied,
                position.collateral.underlyingDecimals
              )
            ) *
            Number(utils.formatUnits(position.collateral.underlyingPrice)) *
            usdPrice
          : 0,
        underlyingDecimals: position.collateral.underlyingDecimals,
        underlyingToken: position.collateral.underlyingToken,
      }}
      poolChainId={position.chainId}
    />
  );
};
