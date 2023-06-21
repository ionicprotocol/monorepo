import type { OpenPosition } from '@midas-capital/types';
import { utils } from 'ethers';

import { SupplyBalance as MarketSupplyBalance } from '@ui/components/pages/PoolPage/MarketsList/SupplyBalance';
import { useBaseCollateral } from '@ui/hooks/leverage/useBaseCollateral';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';

export const EquityValue = ({ position }: { position: OpenPosition }) => {
  const { data: usdPrice } = useUsdPrice(position.chainId.toString());
  const { data: baseCollateral } = useBaseCollateral(position.address, position.chainId);

  return baseCollateral && usdPrice ? (
    <MarketSupplyBalance
      asset={{
        supplyBalance: baseCollateral,
        supplyBalanceFiat:
          Number(utils.formatUnits(baseCollateral, position.collateral.underlyingDecimals)) *
          Number(utils.formatUnits(position.collateral.underlyingPrice)) *
          usdPrice,
        underlyingDecimals: position.collateral.underlyingDecimals,
        underlyingToken: position.collateral.underlyingToken,
      }}
      poolChainId={position.chainId}
    />
  ) : null;
};
