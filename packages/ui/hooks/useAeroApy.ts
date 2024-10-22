import { formatEther } from 'viem';
import { base } from 'viem/chains';
import { useReadContract } from 'wagmi';

import { lpSugarAbi } from '@ui/app/stake/abi/lpSugar';

import { useAllUsdPrices } from './useAllUsdPrices';
import { useIonPrice, useAeroPrice } from './useDexScreenerPrices';

export default function useAeroAPY() {
  const LP_SUGAR_ADDRESS = '0x68c19e13618C41158fE4bAba1B8fb3A9c74bDb0A';
  const ION_POOL_INDEX = 1489n;
  const { data: sugarData } = useReadContract({
    abi: lpSugarAbi,
    address: LP_SUGAR_ADDRESS,
    args: [ION_POOL_INDEX],
    functionName: 'byIndex',
    chainId: base.id
  });
  const { data: ionData } = useIonPrice();
  const { data: aeroPriceData } = useAeroPrice();
  const { data: ethPriceData } = useAllUsdPrices();
  let apy = '-';
  if (!!(sugarData && ionData && ethPriceData && aeroPriceData)) {
    apy =
      (
        ((60 *
          60 *
          24 *
          365.25 *
          Number(formatEther(sugarData.emissions)) *
          Number(aeroPriceData.pair.priceUsd)) /
          (Number(formatEther(sugarData.staked0)) *
            Number(ionData.pair.priceUsd) +
            Number(formatEther(sugarData.staked1)) *
              ethPriceData[base.id].value)) *
        100
      ).toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%';
  }
  return { apy };
}
