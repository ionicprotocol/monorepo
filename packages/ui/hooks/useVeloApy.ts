import { formatEther } from 'viem';
import { useReadContract } from 'wagmi';
import { mode } from 'wagmi/chains';

import { useAllUsdPrices } from './useAllUsdPrices';
import { useIonPrice, useModePrice } from './useDexScreenerPrices';

import { lpSugarAbi } from 'ui/app/stake/abi/lpSugar';

// interface IProps {
//   selectedtoken: string;
// }
export default function useVeloAPY(selectedtoken: string) {
  const LP_SUGAR_ADDRESS = '0x207DfB36A449fd10d9c3bA7d75e76290a0c06731';
  const ION_WETH_POOL_INDEX = 6n;
  const ION_MODE_POOL_INDEX = 26n;
  const { data: sugarData } = useReadContract({
    abi: lpSugarAbi,
    address: LP_SUGAR_ADDRESS,
    args: [
      selectedtoken === 'mode' ? ION_MODE_POOL_INDEX : ION_WETH_POOL_INDEX
    ],
    functionName: 'byIndex',
    chainId: mode.id
  });
  const { data: ionData } = useIonPrice();
  const { data: modePriceData } = useModePrice();
  const { data: ethPriceData } = useAllUsdPrices();
  let apy = '-';
  if (!!(sugarData && ionData && ethPriceData && modePriceData)) {
    apy =
      (
        ((60 *
          60 *
          24 *
          365.25 *
          Number(formatEther(sugarData.emissions)) *
          Number(modePriceData.pair.priceUsd)) /
          (Number(formatEther(sugarData.staked0)) *
            Number(ionData.pair.priceUsd) +
            Number(formatEther(sugarData.staked1)) *
              (selectedtoken !== 'mode'
                ? ethPriceData[mode.id].value
                : Number(modePriceData.pair.priceUsd)))) *
        100
      ).toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%';
  }
  return { apy };
}
