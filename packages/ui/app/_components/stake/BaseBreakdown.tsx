import { formatEther } from 'viem';
import { base } from 'viem/chains';
import { useReadContract } from 'wagmi';

import { lpSugarAbi } from '@ui/app/stake/abi/lpSugar';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useIonPrice, useAeroPrice } from '@ui/hooks/useDexScreenerPrices';

type BaseBreakdownProps = {
  step3Toggle: string;
};
export default function BaseBreakdown({ step3Toggle }: BaseBreakdownProps) {
  return (
    <>
      <div className="flex items-center w-full mt-3 text-xs gap-2">
        <img
          alt="ion logo"
          className={`w-6 h-6 inline-block mx-1 bg-blend-screen`}
          src="/img/logo/AERO.png"
        />
        <AerodromeAPY step3Toggle={step3Toggle} />
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
    </>
  );
}

type AerodromeAPYProps = {
  step3Toggle: string;
};
const AerodromeAPY = ({ step3Toggle }: AerodromeAPYProps) => {
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
  return (
    <>
      <span>Aerodrome APY</span>
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
