import { Skeleton, Text } from '@chakra-ui/react';
import { utils } from 'ethers';

import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallFormatter } from '@ui/utils/bigUtils';

export const WalletBalance = ({ asset, chainId }: { asset: MarketData; chainId: number }) => {
  const { data: balance, isLoading } = useTokenBalance(asset.underlyingToken, chainId);

  return !isLoading ? (
    balance ? (
      <Text variant="tnumber">
        {smallFormatter(Number(utils.formatUnits(balance, asset.underlyingDecimals)))}
      </Text>
    ) : (
      <Text variant="tnumber">-</Text>
    )
  ) : (
    <Skeleton minW={'80px'} />
  );
};
