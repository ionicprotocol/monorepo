import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatEther } from 'viem';
import { useChainId } from 'wagmi';

import ResultHandler from '../ResultHandler';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAllClaimableRewards } from '@ui/hooks/rewards/useAllClaimableRewards';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

interface IClaim {
  chain: number;
}
export default function ClaimRewardPopover({ chain }: IClaim) {
  const { data: rewards } = useAllClaimableRewards([+chain]);
  const [loading, setLoading] = useState<boolean>(false);
  const sdk = useSdk(+chain);
  const chainId = useChainId();
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

  const getSymbol = (chain: number, token: string) =>
    //@ts-ignore
    REWARDS_TO_SYMBOL[chain][token];

  const router = useRouter();

  const hrefTOStake = () => router.push('/stake');
  return (
    <div
      className={`  bg-grayone px-3 py-3 rounded-lg flex flex-col items-start justify-start`}
    >
      <div className={` mb-2 w-full grid grid-cols-3 items-center`}>
        <p className="text-white/60 text-md">Emissions </p>
        <div className="flex items-center justify-start gap-1 col-start-3">
          {rewards && totalRewards > 0n ? (
            rewards?.map((reward, idx) => (
              <img
                alt="icon"
                key={idx}
                className="size-6 rounded mr-1  inline-block"
                src={`/img/symbols/32/color/${getSymbol(+chain, reward.rewardToken)}.png`}
              />
            ))
          ) : (
            <p className="text-white/60 text-xs col-start-3">No Emissions </p>
          )}
        </div>
        {/* {rewards ? "" : } */}
      </div>
      <div className=" w-full grid grid-cols-3 ">
        <div className="flex items-center justify-start gap-4 ">
          {rewards?.map((reward, idx) => (
            <div
              key={idx}
              className={`text-white/80 text-sm flex gap-2 items-center justify-start `}
            >
              <span>{getSymbol(+chain, reward.rewardToken)}</span>
              <span className={`text-accent text-sm`}>
                {Number(formatEther(reward.amount)).toLocaleString('en-US', {
                  maximumFractionDigits: 1
                })}
              </span>
            </div>
          ))}
        </div>
        <button
          className={`rounded-md bg-accent text-black disabled:bg-accent/50 py-0.5 px-3 uppercase truncate text-[11px]  font-semibold col-start-3 `}
          onClick={totalRewards > 0n ? claimAll : hrefTOStake}
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
      </div>
    </div>
  );
}
