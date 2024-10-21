import { formatEther } from 'viem';
import { mode } from 'viem/chains';
import { useReadContract } from 'wagmi';

import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useIonPrice, useModePrice } from '@ui/hooks/useDexScreenerPrices';
import { lpSugarAbi } from '@ui/app/stake/abi/lpSugar';

type ModeBreakdownProps = {
  step3Toggle: string;
  selectedtoken: 'eth' | 'mode' | 'weth';
};
export default function ModeBreakdown({
  step3Toggle,
  selectedtoken
}: ModeBreakdownProps) {
  return (
    <>
      <div className="flex items-center w-full mt-3 text-xs gap-2">
        <img
          alt="ion logo"
          className={`w-6 h-6 inline-block mx-1 bg-blend-screen`}
          src="/img/symbols/32/color/velo.png"
        />
        <VelodromeAPY
          step3Toggle={step3Toggle}
          selectedtoken={selectedtoken}
        />
      </div>
      {/* <div className="flex items-center w-full mt-3 text-xs gap-2">
        <img
          alt="ion logo"
          className={`w-6 h-6 inline-block mx-1`}
          src="/img/logo/ION.png"
        />
        <span>Ionic Points</span>
        <span
          className={`text-accent ml-auto ${
            step3Toggle === 'Unstake' && 'text-red-500'
          }`}
        >
          3x
        </span>
      </div> */}
      <div className="flex items-center w-full mt-3 text-xs gap-2">
        <img
          alt="ion logo"
          className={`w-6 h-6 inline-block mx-1`}
          src="/img/logo/MODE.png"
        />
        <span>Mode Points</span>
        <span
          className={`text-accent ml-auto ${
            step3Toggle === 'Unstake' && 'text-red-500'
          }`}
        >
          {selectedtoken === 'mode' ? '5x' : '3x'}
        </span>
      </div>
    </>
  );
}

export type VelodromeAPYProps = {
  step3Toggle: string;
  selectedtoken: 'eth' | 'mode' | 'weth';
};
const VelodromeAPY = ({ step3Toggle, selectedtoken }: VelodromeAPYProps) => {
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
  return (
    <>
      <span>Velodrome APY</span>
      <span
        className={`text-accent ${
          step3Toggle === 'Unstake' && 'text-red-500'
        } ml-auto`}
      >
        {apy}
      </span>
    </>
  );
};
