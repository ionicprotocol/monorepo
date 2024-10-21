/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useRef, useState } from 'react';

import { type Address, formatEther, type Hex } from 'viem';
import { base } from 'viem/chains';
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract
} from 'wagmi';

import { TradingAbi } from '@ui/constants/modetradingfees';
import { StakingContractAbi } from '@ui/constants/staking';
import {
  getStakingToContract,
  getTradingContractAddress
} from '@ui/utils/getStakingTokens';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import ResultHandler from '../ResultHandler';

interface IProps {
  close: () => void;
  open: boolean;
  chain: string;
  selectedtoken: 'eth' | 'mode' | 'weth';
}

export default function ClaimRewards({
  close,
  open,
  chain,
  selectedtoken
}: IProps) {
  const newRef = useRef(null!);
  const { address, isConnected } = useAccount();

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
        className={`md:w-[30%] w-[80%] h-max relative flex flex-col items-center justify-cente `}
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
          <div className="h-[2px] w-[75%] mx-auto bg-white/10 my-5" />
          <h1 className={` text-center mb-2`}>Emissions</h1>
          <div
            className={`grid grid-cols-3 justify-between w-full items-center text-sm text-white/60`}
          >
            {address && isConnected && (
              <DisplayAndClaimRewards
                address={address}
                chain={chain}
                selectedtoken={selectedtoken}
              />
            )}
          </div>
          <div className="h-[2px] w-[75%] mx-auto bg-white/10 my-5" />
          <h1 className={`mt-4 mb-2 text-center`}>Trading Fees</h1>
          {address && isConnected && (
            <DisplayAndClaimTradingFees
              address={address}
              chain={chain}
              selectedtoken={'eth'}
            />
          )}
          <div className="h-[2px] w-[75%] mx-auto bg-white/10 my-5" />
          {/* <div
            className={` w-max py-1 px-10 mx-auto mt-6 text-sm text-black  bg-accent rounded-md`}
          
         >
            Claim All
          </div> */}
        </div>
      </div>
    </div>
  );
}

type DisplayAndClaimRewardsProps = {
  address: Address;
  chain: string;
  selectedtoken: 'eth' | 'mode' | 'weth';
};
const DisplayAndClaimRewards = ({
  address,
  chain,
  selectedtoken
}: DisplayAndClaimRewardsProps) => {
  const { data: rewards } = useReadContract({
    abi: StakingContractAbi,
    address: getStakingToContract(+chain, selectedtoken),
    args: [address],
    functionName: 'earned',
    chainId: +chain,
    query: {
      enabled: true,
      notifyOnChangeProps: ['data', 'error']
    }
  });
  const { writeContractAsync } = useWriteContract();
  // const chainId = useChainId();
  const [loading, setLoading] = useState<boolean>(false);
  const [hash, setHash] = useState<Address | undefined>();
  const { data: claimReceipt } = useWaitForTransactionReceipt({ hash });
  const chainId = useChainId();
  useEffect(() => {
    if (claimReceipt) {
      setLoading(false);
    }
  }, [claimReceipt]);

  async function claimRewards() {
    try {
      // const switched = await handleSwitchOriginChain(mode.id, chainId);
      // if (!switched) return;
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) return;
      setLoading(true);

      const claiming = await writeContractAsync({
        abi: StakingContractAbi,
        address: getStakingToContract(+chain, selectedtoken),
        args: [address],
        functionName: 'getReward',
        chainId: +chain
      });
      setHash(claiming);

      setLoading(false);
    } catch (err) {
      console.error('Error claiming rewards: ', err);
      setLoading(false);
    }
  }
  // console.log(rewards);

  return (
    <>
      <span className={` mx-auto`}>{+chain === base.id ? 'AERO' : 'MODE'}</span>
      <span className={` mx-auto`}>
        {rewards
          ? Number(formatEther(rewards)).toLocaleString('en-US', {
              maximumFractionDigits: 3
            })
          : '-'}
      </span>
      <button
        className={`mx-auto py-0.5 px-4 text-sm text-black w-max bg-accent disabled:bg-accent/60 rounded-md`}
        onClick={() => claimRewards()}
        disabled={loading || rewards === BigInt(0)}
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
    </>
  );
};

const DisplayAndClaimTradingFees = ({
  address,
  chain
}: DisplayAndClaimRewardsProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { data: tradingFees, isLoading } = useReadContracts({
    contracts: [
      {
        abi: TradingAbi,
        address: getTradingContractAddress(+chain),
        args: [address],
        functionName: 'claimable0',
        chainId: +chain
      },
      {
        abi: TradingAbi,
        address: getTradingContractAddress(+chain),
        args: [address],
        functionName: 'claimable1',
        chainId: +chain
      }
    ],
    query: {
      enabled: true,
      notifyOnChangeProps: ['data', 'error']
    }
  });
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState<Hex | undefined>();
  const { data: claimReceipt } = useWaitForTransactionReceipt({ hash });
  const chainId = useChainId();

  useEffect(() => {
    if (claimReceipt) {
      setLoading(false);
    }
  }, [claimReceipt]);

  async function claimTradingFees() {
    try {
      // const switched = await handleSwitchOriginChain(mode.id, chainId);
      // if (!switched) return;
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) return;
      setLoading(true);

      const claiming = await writeContractAsync({
        abi: TradingAbi,
        address: getTradingContractAddress(+chain),
        args: [],
        functionName: 'claimFees'
      });
      setHash(claiming);
    } catch (err) {
      console.error('Error claiming trading fees: ', err);
    }
  }

  return (
    <>
      <div
        className={`grid grid-cols-3  w-full items-center text-sm text-white/60`}
      >
        <span className={` mx-auto`}>ION</span>
        <span className={` mx-auto`}>
          {tradingFees && tradingFees[0].result
            ? Number(formatEther(tradingFees[0].result)).toLocaleString(
                'en-US',
                {
                  maximumFractionDigits: 3
                }
              )
            : '0'}
        </span>
      </div>
      <div
        className={`grid grid-cols-3  w-full items-center text-sm text-white/60`}
      >
        <span className={` mx-auto`}>WETH</span>
        <span className={` mx-auto`}>
          {tradingFees && tradingFees[1].result
            ? Number(formatEther(tradingFees[1].result)).toLocaleString(
                'en-US',
                {
                  maximumFractionDigits: 7
                }
              )
            : '0'}
        </span>
        <button
          className={` mx-auto py-0.5 px-4 text-sm text-black w-max bg-accent rounded-md`}
          onClick={() => claimTradingFees()}
          disabled={
            isLoading ||
            loading ||
            (tradingFees && tradingFees[0].result === BigInt(0)) ||
            (tradingFees && tradingFees[1].result === BigInt(0))
          }
        >
          <ResultHandler
            isLoading={isLoading || loading}
            height="20"
            width="20"
            color={'#000000'}
          >
            Claim
          </ResultHandler>
        </button>
      </div>
    </>
  );
};
