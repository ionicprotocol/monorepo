/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useRef, useState } from 'react';
import { formatEther } from 'viem';
import { mode } from 'viem/chains';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient
} from 'wagmi';

import ResultHandler from '../ResultHandler';

import {
  StakingContractAbi,
  StakingContractAddress
} from '@ui/constants/staking';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

interface IProps {
  close: () => void;
  open: boolean;
}

export default function ClaimRewards({ close, open }: IProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const newRef = useRef(null!);

  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [rewards, setRewards] = useState<bigint>(BigInt(0));

  async function claimRewards() {
    try {
      if (!isConnected) {
        console.error('Not connected');
        return;
      }
      const switched = await handleSwitchOriginChain(mode.id, chainId);
      if (!switched) return;
      setLoading(true);

      const claiming = await walletClient!.writeContract({
        abi: StakingContractAbi,
        account: walletClient?.account,
        address: StakingContractAddress,
        args: [address],
        functionName: 'getReward'
      });

      const hash = await publicClient?.waitForTransactionReceipt({
        hash: claiming
      });
      setLoading(false);
      // eslint-disable-next-line no-console
      console.log({ hash: hash?.transactionHash });
    } catch (err) {
      setLoading(false);
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }
  useEffect(() => {
    async function getRewards() {
      try {
        if (!isConnected) return;
        await handleSwitchOriginChain(mode.id, chainId);
        if (loading) {
          //reloading prices
        }
        const totalRewards = (await publicClient?.readContract({
          abi: StakingContractAbi,
          address: StakingContractAddress,
          args: [address],
          functionName: 'rewards'
        })) as bigint;

        setRewards(totalRewards);

        // eslint-disable-next-line no-console
        console.log(totalRewards);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    }
    getRewards();
  }, [address, chainId, isConnected, publicClient, loading]);

  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      //@ts-ignore
      if (newRef.current && !newRef.current?.contains(e?.target)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [close]);

  return (
    <div
      className={` z-50 fixed top-0 right-0 w-full h-screen  bg-black/35 ${
        open ? 'flex' : 'hidden'
      } items-center justify-center transition-opacity duration-300 overflow-y-auto animate-fade-in animated backdrop-blur-sm`}
    >
      <div
        className={`w-[30%] h-max relative flex flex-col items-center justify-cente `}
        ref={newRef}
      >
        <div className={`bg-grayUnselect w-full p-4 rounded-md`}>
          <div
            className={`  mb-5 text-xl px-4 flex items-center justify-between`}
          >
            <span>Claim Rewards</span>
            <img
              alt="close"
              className={` h-5 cursor-pointer `}
              onClick={() => close()}
              src="/img/assets/close.png"
            />
          </div>
          <h1 className={` text-center mb-2`}>Emissions</h1>
          <div
            className={`grid grid-cols-3 justify-between w-full items-center text-sm text-white/60`}
          >
            <span className={` mx-auto`}>Mode</span>
            <span className={` mx-auto`}>
              {Number(formatEther(rewards)).toLocaleString('en-US', {
                maximumFractionDigits: 3
              })}
            </span>
            <button
              className={`mx-auto py-0.5 px-4 text-sm text-black w-max bg-accent rounded-md`}
              onClick={() => claimRewards()}
              disabled={loading}
            >
              <ResultHandler
                isLoading={loading}
                height="20"
                width="20"
                color={'#000000'}
              >
                Claim
              </ResultHandler>
            </button>
          </div>
          <h1 className={`mt-4 mb-2 text-center`}>Trading Fees</h1>
          <div
            className={`grid grid-cols-3  w-full items-center text-sm text-white/60`}
          >
            <span className={` mx-auto`}>ION</span>
            <span className={` mx-auto`}>0.9</span>
          </div>
          <div
            className={`grid grid-cols-3  w-full items-center text-sm text-white/60`}
          >
            <span className={` mx-auto`}>Weth</span>
            <span className={` mx-auto`}>1.9</span>
            <button
              className={` mx-auto py-0.5 px-4 text-sm text-black w-max bg-accent rounded-md`}
            >
              Claim
            </button>
          </div>
          <div
            className={` w-max py-1 px-10 mx-auto mt-6 text-sm text-black  bg-accent rounded-md`}
          >
            Claim All
          </div>
        </div>
      </div>
    </div>
  );
}
