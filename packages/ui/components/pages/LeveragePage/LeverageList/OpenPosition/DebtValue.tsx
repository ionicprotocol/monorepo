import { Text } from '@chakra-ui/react';
import type { OpenPosition, PositionInfo } from '@midas-capital/types';
import { BigNumber, utils } from 'ethers';

import { SupplyBalance as MarketSupplyBalance } from '@ui/components/pages/PoolPage/MarketsList/SupplyBalance';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';

export const DebtValue = ({ info, position }: { info?: PositionInfo; position: OpenPosition }) => {
  const { data: usdPrice } = useUsdPrice(position.chainId.toString());

  return info && usdPrice ? (
    <MarketSupplyBalance
      asset={{
        supplyBalance: info.debtAmount,
        supplyBalanceFiat:
          Number(utils.formatUnits(info.debtAmount, position.borrowable.underlyingDecimals)) *
          Number(utils.formatUnits(position.borrowable.underlyingPrice)) *
          usdPrice,
        underlyingDecimals: BigNumber.from(position.borrowable.underlyingDecimals.toString()),
        underlyingToken: position.borrowable.underlyingToken,
      }}
      poolChainId={position.chainId}
    />
  ) : (
    <Text textAlign="right">-</Text>
  );
};
