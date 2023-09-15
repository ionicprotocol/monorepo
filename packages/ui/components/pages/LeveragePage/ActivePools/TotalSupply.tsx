import { Text } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useMemo } from 'react';
import type { NewPosition } from 'types/dist';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';

export const TotalSupply = ({ position }: { position: NewPosition }) => {
  const { data: price } = useUsdPrice(position.chainId.toString());
  const totalSupplyNative =
    Number(
      utils.formatUnits(position.collateral.totalSupplied, position.collateral.underlyingDecimals)
    ) * Number(utils.formatUnits(position.collateral.underlyingPrice, 18));

  const totalSupply = useMemo(() => {
    if (price) {
      return totalSupplyNative * price;
    } else {
      return null;
    }
  }, [price, totalSupplyNative]);

  return totalSupply ? (
    <BalanceCell
      primary={{
        value: totalSupply
      }}
    />
  ) : (
    <Text>-</Text>
  );
};
