/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import {
  erc20Abi,
  formatEther,
  parseEther,
  parseUnits,
  zeroAddress
} from 'viem';
import { mode } from 'viem/chains';
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract
  // useBlock
} from 'wagmi';

import { ixErc20 } from '@ui/constants/bridge';
import { pools } from '@ui/constants/index';
import { BridgingContractAddress, getToken } from '@ui/utils/getStakingTokens';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import { useOutsideClick } from '../../hooks/useOutsideClick';
import ResultHandler from '../_components/ResultHandler';
import MaxDeposit from '../_components/stake/MaxDeposit';
import FromTOChainSelector from '../_components/xION/FromToChainSelector';
import ProgressSteps from '../_components/xION/ProgressSteps';
import Quote, { lzOptions } from '../_components/xION/Quote';
// import TxPopup from '../_components/xION/TxPopup';

import type { Address, Hex } from 'viem';

import { xErc20LayerZeroAbi } from '@ionicprotocol/sdk';

const TxPopup = dynamic(() => import('../_components/xION/TxPopup'), {
  ssr: false
});

// import useLocalStorage from '@ui/hooks/useLocalStorage';

export default function XION() {
  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const toChain = searchParams.get('toChain');
  const chain = querychain ?? String(chainId);
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [destinationAddress, setDestinationAddress] = useState<
    Address | undefined
  >(address);
  const { data: allowance } = useReadContract({
    abi: erc20Abi,
    address: getToken(+chain),
    functionName: 'allowance',
    args: [address ?? zeroAddress, BridgingContractAddress[+chain]]
  });
  const { data: sourceLimits } = useReadContract({
    abi: ixErc20,
    address: getToken(+chain),
    functionName: 'bridges',
    args: [BridgingContractAddress[+chain]],
    chainId: +chain
  });
  const { data: destinationLimits } = useReadContract({
    abi: ixErc20,
    address: getToken(+(toChain ?? mode.id)),
    functionName: 'bridges',
    args: [BridgingContractAddress[+(toChain ?? mode.id)]],
    chainId: +(toChain ?? mode.id)
  });

  const {
    componentRef: fromRef,
    isopen: fromIsOpen,
    toggle: fromToggle
  } = useOutsideClick();
  const {
    componentRef: toRef,
    isopen: toIsOpen,
    toggle: toToggle
  } = useOutsideClick();
  const {
    componentRef: bridgeRef,
    isopen: bridgeIsOpen,
    toggle: bridgeToggle
  } = useOutsideClick();
  //----------------------
  // const blockInitial = useBlock({
  //   chainId: +(toChain ?? mode.id)
  // });
  const [deposit, setDeposit] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [nativeEth, setNativeEth] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState<{
    approvalStatus: boolean;
    bridgingStatus: boolean;
  }>({
    approvalStatus: false,
    bridgingStatus: false
  });

  const [popup, setPopup] = useState<{
    status: boolean;
    amount: bigint;
    hash: string;
    approvalHash: string;
    fromChain: string;
    toChain: string;
    bridgeStatus: 'completed' | 'error' | 'pending' | 'unknown';
  }>({
    status: false,
    amount: BigInt(0),
    hash: '0x1234567890abcdef1234567890abcdef12345678',
    fromChain: chain,
    toChain: toChain ?? '34443',
    approvalHash: '0x123456789',
    bridgeStatus: 'unknown'
  });

  useEffect(() => {
    if (address && allowance && allowance >= parseEther(deposit)) {
      setProgress(2);
    } else {
      setProgress(0);
    }
  }, [allowance, deposit, address]);

  async function approval(amount: bigint) {
    try {
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) return;
      if (!isConnected) {
        console.warn('Wallet not connected');
        return;
      }
      if (amount <= BigInt(0)) return;
      setLoading((p) => ({ ...p, approvalStatus: true }));
      setProgress(1);

      const approval = await writeContractAsync({
        abi: erc20Abi,
        account: address,
        address: getToken(+chain),
        args: [BridgingContractAddress[+chain], amount],
        functionName: 'approve'
      });

      console.warn('Approval hash --> ' + approval);
      setLoading((p) => ({ ...p, approvalStatus: false }));
      setPopup((p) => ({
        ...p,
        approvalHash: approval
      }));
      setProgress(2);
    } catch (err) {
      console.warn(err);
      setLoading((p) => ({ ...p, approvalStatus: false }));
      setProgress(0);
    }
  }

  // console.log(blockInitial);

  interface IBridgeArgs {
    token: Address;
    amount: bigint;
    toAddress: Address;
    destinationChain: number;
    nativeEth: bigint;
  }
  async function bridging(args: IBridgeArgs) {
    try {
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) return;
      if (!isConnected) {
        console.warn('Wallet not connected');
        return;
      }
      if (args.amount <= BigInt(0)) return;
      setLoading((p) => ({ ...p, bridgingStatus: true }));

      const bridging = await writeContractAsync({
        abi: xErc20LayerZeroAbi,
        address: BridgingContractAddress[+chain],
        args: [
          args.token,
          args.amount,
          args.toAddress,
          args.destinationChain,
          lzOptions as Hex
        ],
        functionName: 'send',
        chainId: +chain,
        value: args.nativeEth
      });

      console.warn('Bridging hash -->  ' + bridging);

      setLoading((p) => ({ ...p, bridgingStatus: false }));
      setPopup((p) => ({
        ...p,
        status: true,
        amount: args.amount,
        hash: bridging,
        fromChain: chain,
        toChain: args.destinationChain.toString(),
        bridgeStatus: 'pending'
        // bridgeInitialBLock: ''
      }));
      //---------------- for future use
      // setInit(
      //   JSON.stringify({
      //     hasHistory: true,
      //     amount: args.amount,
      //     hash: bridging,
      //     fromChain: chain,
      //     toChain: args.destinationChain.toString(),
      //     bridgeStatus: 'pending',
      //     approvalHash: popup.approvalHash,
      //     bridgingBlock: blockInitial.data?.number
      //   })
      // );
      setDeposit('');
      bridgeToggle();
      setProgress(0);
    } catch (err) {
      console.error('Error claiming rewards: ', err);
      setLoading((p) => ({ ...p, bridgingStatus: false }));
      setProgress(2);
    }
  }
  return (
    <div className={` `}>
      <TxPopup
        close={bridgeToggle}
        open={bridgeIsOpen}
        bridgeref={bridgeRef}
        mock={popup}
      />
      <div className="bg-grayone  p-6 rounded-xl xl:max-w-[45%] sm:w-[75%] md:w-[60%]  w-[95%] mx-auto my-20">
        <div className={`mb-2 flex items-center justify-between`}>
          <h2 className="text-lg ">Bridge</h2>
          <h2 className="text-xs text-white/50 ">
            Track Bridge{' '}
            <img
              className={`inline-block w-3 h-3 mx-0.5 cursor-pointer`}
              src="https://img.icons8.com/ios/50/ffffff/info--v1.png"
              alt="info--v1"
              onClick={() => bridgeToggle()}
            />
          </h2>
        </div>

        <div className="mb-4">
          {/* <p className=" text-sm text-white/50 ">TOKEN AMOUNT</p> */}
          <div className={`flex flex-col  `}>
            <MaxDeposit
              headerText="Token Amount"
              amount={deposit}
              tokenName={'ion'}
              token={getToken(+chain)}
              handleInput={(val?: string) => setDeposit(val ?? '')}
              chain={+chain}
              // tokenSelector={true}
              tokenArr={['ion']}
            />
          </div>
        </div>
        {/* <div className="h-[2px] w-[100%] mx-auto bg-white/10 my-5" /> */}
        <div className={`grid grid-cols-2 gap-x-4`}>
          <div className="mb-2 ">
            <p className=" text-xs text-white/50">FROM</p>
            <FromTOChainSelector
              newRef={fromRef}
              open={fromIsOpen}
              setOpen={fromToggle}
              fromChainId={+chain}
            />
          </div>

          <div className="mb-2 ">
            <p className=" text-xs text-white/50">TO</p>
            <FromTOChainSelector
              newRef={toRef}
              open={toIsOpen}
              setOpen={toToggle}
              mode="toChain"
            />
          </div>
        </div>
        <div className="mb-4">
          <p className="text-xs text-white/50 mb-1">TO ADDRESS</p>
          <input
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value as Address)}
            placeholder="Enter address"
            className="text-sm w-full bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="h-[2px] w-[100%] mx-auto bg-white/10 my-5" />
        <Quote
          chain={+chain}
          getQuote={(data) => setNativeEth(parseEther(data))}
          args={{
            amount: parseUnits(deposit, 18),
            destinationChain: Number(toChain),
            toAddress: destinationAddress!,
            token: getToken(+chain)
          }}
        />

        <div className={`flex items-center justify-center w-full gap-2`}>
          <button
            disabled={progress >= 1 || !deposit ? true : false}
            className={`my-3 py-1.5 text-sm ${pools[+chain].text} w-full ${pools[+chain].bg ?? pools[mode.id].bg} rounded-md flex items-center justify-center disabled:opacity-60`}
            onClick={() => approval(parseUnits(deposit, 18))}
          >
            <ResultHandler
              isLoading={loading.approvalStatus}
              height="20"
              width="20"
              color={'#000000'}
            >
              Approve
            </ResultHandler>
          </button>
          <button
            disabled={progress < 2 ? true : false}
            className={`my-3 py-1.5 text-sm ${pools[+chain].text} w-full ${pools[+chain].bg ?? pools[mode.id].bg} rounded-md flex items-center justify-center disabled:opacity-60`}
            onClick={() =>
              bridging({
                token: getToken(+chain),
                amount: parseUnits(deposit, 18),
                toAddress: destinationAddress!,
                destinationChain: Number(toChain),
                nativeEth: nativeEth
              })
            }
          >
            <ResultHandler
              isLoading={loading.bridgingStatus}
              height="20"
              width="20"
              color={'#000000'}
            >
              Bridge
            </ResultHandler>
          </button>
        </div>
        <div className={`w-[70%] mx-auto mt-3`}>
          <ProgressSteps
            bg={`${pools[+chain]?.bg ?? pools[mode.id]?.bg}`}
            progress={progress}
          />
        </div>

        <div className="text-sm pt-4">Bridge Capacity</div>
        <div className="flex items-center">
          <div className="text-xs text-white/50 pr-2">
            Source:{' '}
            {Number(
              formatEther(sourceLimits?.[1].currentLimit ?? 0n)
            ).toLocaleString('en-US', { maximumFractionDigits: 0 })}{' '}
            ION
          </div>
          <div className="text-xs text-white/50">
            Destination:{' '}
            {Number(
              formatEther(destinationLimits?.[1].currentLimit ?? 0n)
            ).toLocaleString('en-US', { maximumFractionDigits: 0 })}{' '}
            ION
          </div>
        </div>
        <div className="text-xxs text-white/50">
          Bridge Capacity resets every 24h
        </div>
      </div>
    </div>
  );
}
