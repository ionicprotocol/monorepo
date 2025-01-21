import { formatEther } from 'viem';
import { mode } from 'viem/chains';
import { useReadContract } from 'wagmi';

import { lpSugarAbi } from '@ui/app/stake/abi/lpSugar';

import { useIonPrice, useTokenPrice } from './useDexScreenerPrices';
import { useUsdPrice } from './useUsdPrices';

const WETH_ADDRESSES = {
  10: '0x4200000000000000000000000000000000000006',
  8453: '0x4200000000000000000000000000000000000006',
  34443: '0x4200000000000000000000000000000000000006'
} as const;

interface BaseSugarAPRProps {
  sugarAddress: `0x${string}`;
  poolIndex: bigint;
  chainId: number;
}

interface ModeSugarAPRProps extends BaseSugarAPRProps {
  selectedToken?: 'eth' | 'mode' | 'weth';
  isMode?: boolean;
}

export default function useSugarAPR({
  sugarAddress,
  poolIndex,
  chainId,
  selectedToken,
  isMode
}: ModeSugarAPRProps) {
  const { data: sugarData } = useReadContract({
    abi: lpSugarAbi,
    address: sugarAddress,
    args: [poolIndex],
    functionName: 'byIndex',
    chainId
  });

  const { data: ionData } = useIonPrice({ chainId });
  const { data: rewardTokenData } = useTokenPrice(chainId);
  const { data: modePriceData } = useTokenPrice(mode.id);
  const { data: ethPrice } = useUsdPrice(chainId);
  const { data: modeEthPrice } = useUsdPrice(mode.id);

  let apr = '-';
  if (
    !!(
      sugarData &&
      ionData &&
      ethPrice &&
      (isMode ? modePriceData : rewardTokenData)
    )
  ) {
    const yearlyMultiplier = 60 * 60 * 24 * 365.25;
    const emissionsPerSecond = Number(formatEther(sugarData.emissions));
    const yearlyEmissions = emissionsPerSecond * yearlyMultiplier;

    let rewardTokenPrice = 0;
    if (isMode && modePriceData) {
      rewardTokenPrice = Number(modePriceData.pair?.priceUsd || 0);
    } else if (rewardTokenData) {
      rewardTokenPrice = Number(rewardTokenData.pair?.priceUsd || 0);
    }

    const yearlyRewardsUSD = yearlyEmissions * rewardTokenPrice;

    let totalStakedUSD = 0;

    if (isMode && selectedToken && modePriceData) {
      // Mode-specific logic
      totalStakedUSD =
        Number(formatEther(sugarData.staked0)) *
          Number(ionData.pair?.priceUsd || 0) +
        Number(formatEther(sugarData.staked1)) *
          (selectedToken !== 'mode'
            ? modeEthPrice || 0
            : Number(modePriceData.pair?.priceUsd || 0));
    } else {
      // Original logic
      const wethAddress =
        WETH_ADDRESSES[chainId as keyof typeof WETH_ADDRESSES]?.toLowerCase();
      const isToken0Weth = sugarData.token0.toLowerCase() === wethAddress;

      const staked0USD =
        Number(formatEther(sugarData.staked0)) *
        (isToken0Weth ? ethPrice : Number(ionData.pair.priceUsd));
      const staked1USD =
        Number(formatEther(sugarData.staked1)) *
        (isToken0Weth ? Number(ionData.pair.priceUsd) : ethPrice);

      totalStakedUSD = staked0USD + staked1USD;
    }

    const aprValue = (yearlyRewardsUSD / totalStakedUSD) * 100;
    apr = aprValue.toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%';
  }

  return { apr };
}
