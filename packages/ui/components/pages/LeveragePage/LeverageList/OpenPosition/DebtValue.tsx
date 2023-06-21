import { Text } from '@chakra-ui/react';
import type { OpenPosition, PositionInfo } from '@midas-capital/types';
import { utils } from 'ethers';

import { SupplyBalance as MarketSupplyBalance } from '@ui/components/pages/PoolPage/MarketsList/SupplyBalance';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';

export const DebtValue = ({ info, position }: { info?: PositionInfo; position: OpenPosition }) => {
  const { data: usdPrice } = useUsdPrice(position.chainId.toString());

  return info && usdPrice ? (
    <MarketSupplyBalance
      asset={{
        supplyBalance: info.debtAmount,
        supplyBalanceFiat:
          Number(utils.formatUnits(info.debtAmount, position.collateral.underlyingDecimals)) *
          Number(utils.formatUnits(position.collateral.underlyingPrice)) *
          usdPrice,
        underlyingDecimals: position.collateral.underlyingDecimals,
        underlyingToken: position.collateral.underlyingToken,
      }}
      poolChainId={position.chainId}
    />
  ) : (
    <Text textAlign="right">-</Text>
  );
};
