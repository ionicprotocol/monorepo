import { BigNumber, utils } from 'ethers';
import { useMemo } from 'react';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

export const useSupplyCap = (
  comptrollerAddress: string,
  cToken: string,
  underlyingPrice: BigNumber,
  poolChainId: number
) => {
  const { data: cTokenData } = useCTokenData(comptrollerAddress, cToken, poolChainId);
  const cgId = useCgId(Number(poolChainId));
  const { data: usdPrice } = useUSDPrice(cgId);

  const max = useMemo(() => {
    if (cTokenData && usdPrice) {
      return (
        Number(utils.formatUnits(cTokenData.supplyCaps, DEFAULT_DECIMALS)) *
        Number(utils.formatUnits(underlyingPrice, DEFAULT_DECIMALS)) *
        usdPrice
      );
    } else {
      return undefined;
    }
  }, [cTokenData, usdPrice, underlyingPrice]);

  return max;
};
