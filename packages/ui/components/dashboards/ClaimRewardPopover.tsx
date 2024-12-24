/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { formatEther } from 'viem';
import { useChainId } from 'wagmi';

import { REWARDS_TO_SYMBOL, chainsArr } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAllClaimableRewards } from '@ui/hooks/rewards/useAllClaimableRewards';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import ResultHandler from '../ResultHandler';

interface IClaim {
  chain: number;
  allchain: number[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rewardRef: any;
  isOpen: boolean;
  close: () => void;
}
export default function ClaimRewardPopover({
  allchain,
  isOpen,
  close,
  rewardRef,
  chain
}: IClaim) {
  const { data: rewards } = useAllClaimableRewards(allchain);
  const [loading, setLoading] = useState<boolean>(false);
  const chainId = useChainId();
  const sdk = useSdk(+chain);
  async function claimAll() {
    try {
      const result = await handleSwitchOriginChain(+chain, chainId);
      if (!result) return;
      setLoading(true);
      await sdk?.claimAllRewards();
      setLoading(false);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }
  // console.log(rewards);
  const totalRewards =
    rewards?.reduce((acc, reward) => acc + reward.amount, 0n) ?? 0n;

  const getSymbol = (chain: number, token: `0x${string}`): string => {
    // Check if the chain exists in the mapping
    if (!REWARDS_TO_SYMBOL[chain]) {
      console.warn(`Chain ${chain} not found in REWARDS_TO_SYMBOL`);
      return 'UNKNOWN';
    }

    // Check if the token exists for that chain
    if (!REWARDS_TO_SYMBOL[chain][token]) {
      console.warn(`Token ${token} not found for chain ${chain}`);
      return 'UNKNOWN';
    }

    return REWARDS_TO_SYMBOL[chain][token];
  };

  const router = useRouter();

  const hrefTOStake = () => router.push('/stake');
  // <img width="48" height="48" src="https://img.icons8.com/color/48/ok--v1.png" alt="ok--v1"/>
  return (
    <div
      className={` z-50 fixed top-0 right-0 w-full h-screen  bg-black/35 ${
        isOpen ? 'flex' : 'hidden'
      } items-center justify-center transition-opacity duration-300 overflow-y-auto animate-fade-in animated backdrop-blur-sm`}
    >
      <div
        className={`xl:w-[30%] lg:w-[40%] md:w-[50%] sm:w-[60%] w-[80%] h-max relative flex flex-col bg-graylite rounded-md py-4 px-4 items-center justify-cente `}
        ref={rewardRef}
      >
        <div
          className={` w-full  mb-5 text-xl px-4 flex items-center justify-between`}
        >
          <span>Claim Rewards</span>
          <img
            alt="close"
            className={` h-5 cursor-pointer `}
            onClick={() => close()}
            src="/img/assets/close.png"
          />
        </div>
        <div className={` mb-2 w-full grid grid-cols-4 items-center`}>
          <div
            className={`grid grid-cols-4 w-full col-span-4 text-[10px] mb-3 text-white/50 items-center justify-center text-center `}
          >
            <span>Token</span>
            <span>Amount</span>
            <span>Network</span>
            <span>Select</span>
          </div>

          <div className=" items-center justify-start gap-1 gap-y-2 w-full grid grid-cols-4 col-span-4 ">
            {rewards && totalRewards > 0n ? (
              rewards?.map((reward, idx) => (
                <div
                  key={idx}
                  className={` grid grid-cols-4 col-span-4`}
                >
                  <div className={`flex  gap-1 items-center justify-center`}>
                    <img
                      alt="icon"
                      className="size-4 rounded   inline-block"
                      src={`/img/symbols/32/color/${getSymbol(+reward.chainId, reward.rewardToken as `0x${string}`)}.png`}
                    />
                    <span className={`text-xs`}>
                      {getSymbol(
                        +reward.chainId,
                        reward.rewardToken as `0x${string}`
                      )?.toUpperCase()}
                    </span>
                  </div>
                  <div className={` flex gap-1 items-center justify-center `}>
                    <span className={`text-accent text-sm`}>
                      {Number(formatEther(reward.amount)).toLocaleString(
                        'en-US',
                        {
                          maximumFractionDigits: 1
                        }
                      )}
                    </span>
                    <span className={`text-xs`}>
                      {getSymbol(
                        reward.chainId,
                        reward.rewardToken as `0x${string}`
                      )}
                    </span>
                  </div>
                  <img
                    alt="icon"
                    className="size-5 rounded mx-auto  inline-block"
                    src={`/img/symbols/32/color/${chainsArr[+reward.chainId]}.png`}
                  />
                  {reward.chainId === chain ? (
                    <img
                      alt="icon"
                      className="size-4 rounded mx-auto  inline-block"
                      src={`https://img.icons8.com/ios-filled/50/11F979/checkmark--v1.png`}
                    />
                  ) : (
                    <div className={`w-2 h-2 mx-auto border border-gray-600`} />
                  )}
                </div>
              ))
            ) : (
              <p className="text-white/60 text-xs grid grid-cols-4 col-span-4 ">
                No Emissions{' '}
              </p>
            )}
          </div>
        </div>
        <div className={`text-[8px] text-white/50 my-1`}>
          Note : Switch to respective network for claiming rewards
        </div>
        <button
          className={`rounded-md bg-accent text-black disabled:bg-accent/50 py-1.5 px-3 uppercase truncate text-[11px]  font-semibold mb-2 `}
          onClick={totalRewards > 0n ? () => claimAll() : hrefTOStake}
          disabled={loading && totalRewards > 0n}
        >
          <ResultHandler
            isLoading={loading}
            height="20"
            width="20"
            color={'#000000'}
          >
            {totalRewards > 0n ? 'Claim All Rewards' : 'Stake Rewards'}
          </ResultHandler>
        </button>
        {/* </div> */}
      </div>
    </div>
  );
}
