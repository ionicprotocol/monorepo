import { utils } from 'ethers';
import { useMemo } from 'react';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useTokenData } from '@ui/hooks/useTokenData';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { MarketData } from '@ui/types/TokensDataMap';

export const TotalSupply = ({
  asset,
  comptrollerAddress,
  poolChainId,
}: {
  asset: MarketData;
  comptrollerAddress: string;
  poolChainId: number;
}) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const { data: cTokenData } = useCTokenData(comptrollerAddress, asset.cToken, poolChainId);
  const cgId = useCgId(Number(poolChainId));
  const { data: usdPrice } = useUSDPrice(cgId);

  const max = useMemo(() => {
    if (cTokenData && usdPrice) {
      return (
        Number(utils.formatUnits(cTokenData.supplyCaps, DEFAULT_DECIMALS)) *
        Number(utils.formatUnits(asset.underlyingPrice, DEFAULT_DECIMALS)) *
        usdPrice
      );
    } else {
      return undefined;
    }
  }, [cTokenData, usdPrice, asset.underlyingPrice]);

  return (
    <BalanceCell
      primary={{
        value: asset.totalSupplyFiat,
        max,
      }}
      secondary={{
        value: asset.totalSupply,
        symbol: tokenData?.symbol || '',
        decimals: asset.underlyingDecimals.toNumber(),
      }}
    />
  );
};
