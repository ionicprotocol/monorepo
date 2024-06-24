/* eslint-disable @next/next/no-img-element */
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { mode } from 'viem/chains';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient
} from 'wagmi';

import MaxDeposit from '../_components/stake/MaxDeposit';

import {
  LiquidityContractAbi,
  LiquidityContractAddress
} from '@ui/constants/lp';
import {
  StakingContractAbi,
  StakingContractAddress
} from '@ui/constants/staking';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

const Widget = dynamic(() => import('../_components/stake/Widget'), {
  ssr: false
});

// import { Widget } from '../_components/stake/Widget';

export default function Stake() {
  const [widgetPopup, setWidgetPopup] = useState<boolean>(false);
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [maxDeposit, setMaxDeposit] = useState<{ ion: string; eth: string }>({
    ion: '0',
    eth: '0'
  });

  const temporaryArgs = {
    token: '0x18470019bf0e94611f15852f7e93cf5d65bc34ca',
    stable: false,
    //@ts-ignore
    amountTokonDesired: 20075338509533417529735n,
    //@ts-ignore
    amounTokenMin: 19071571584056746653248n,
    //@ts-ignore
    amountETHMin: 133898491919691498n,
    to: '0x5a9e792143bf2708b4765c144451dca54f559a19',
    deadline: 1718881843
  };

  async function addLiquidity() {
    try {
      if (!isConnected) {
        console.error('Not connected');
        return;
      }
      await handleSwitchOriginChain(mode.id, chainId);
      const tx = await walletClient!.writeContract({
        abi: LiquidityContractAbi,
        account: walletClient?.account,
        address: LiquidityContractAddress,
        args: [
          temporaryArgs.token,
          temporaryArgs.stable,
          temporaryArgs.amountTokonDesired,
          temporaryArgs.amounTokenMin,
          temporaryArgs.amountETHMin,
          temporaryArgs.to,
          temporaryArgs.deadline
        ],
        functionName: 'addLiquidityETH'
      });
      // eslint-disable-next-line no-console
      console.log('Transaction Hash --->>>', tx);
      if (!tx) return;
      const transaction = await publicClient?.waitForTransactionReceipt({
        hash: tx
      });
      // eslint-disable-next-line no-console
      console.log('Transaction --->>>', transaction);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    } finally {
    }
  }

  async function stakingAsset() {
    try {
      if (!isConnected) {
        console.error('Not connected');
        return;
      }
      await handleSwitchOriginChain(mode.id, chainId);
      const tx = await walletClient!.writeContract({
        abi: StakingContractAbi,
        account: walletClient?.account,
        address: StakingContractAddress,
        //@ts-ignore
        args: [77380419677738983956n],
        functionName: 'deposit'
      });
      // eslint-disable-next-line no-console
      console.log('Transaction Hash --->>>', tx);
      if (!tx) return;
      const transaction = await publicClient?.waitForTransactionReceipt({
        hash: tx
      });
      // eslint-disable-next-line no-console
      console.log('Transaction --->>>', transaction);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    } finally {
    }
  }

  return (
    <main className={``}>
      <div className="w-full flex items-center justify-center py-20 transition-all duration-200 ease-linear bg-black dark:bg-black relative">
        <Widget
          close={() => setWidgetPopup(false)}
          open={widgetPopup}
        />

        <div className={`md:w-[50%] w-[90%] mx-auto grid grid-cols-2 gap-4`}>
          <div
            className={`bg-grayone col-span-2 flex flex-col items-center justify-center py-4 px-8 rounded-xl gap-y-3 `}
          >
            <h1 className={` text-lg`}>
              Step 1. Buy
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block mx-1`}
                src="/img/symbols/32/color/ion.png"
              />
              ION Tokens
            </h1>
            <button
              className={` py-1.5 text-sm text-black w-full bg-accent rounded-md`}
              onClick={() => setWidgetPopup(true)}
            >
              Buy ION Tokens
            </button>
          </div>
          <div className={`w-full h-max bg-grayone px-4 rounded-xl py-2`}>
            <h1 className={` text-lg`}>Step 2. LP your ION Tokens</h1>
            <MaxDeposit
              amount={maxDeposit.ion}
              tokenName={'ion'}
              token={'0x18470019bf0e94611f15852f7e93cf5d65bc34ca'}
              handleInput={(val?: string) =>
                setMaxDeposit((p) => {
                  return { ...p, ion: val || '' };
                })
              }
            />
            <MaxDeposit
              amount={maxDeposit.eth}
              tokenName={'eth'}
              token={'0x0000000000000000000000000000000000000000'}
              handleInput={(val?: string) =>
                setMaxDeposit((p) => {
                  return { ...p, eth: val || '' };
                })
              }
            />

            {/* liner */}

            <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-5" />
            {/* <h1> Expected LP </h1>
            <div
              className={`flex w-full mt-2 items-center justify-between text-md `}
            >
              <input
                className={`focus:outline-none amount-field font-bold bg-transparent flex-auto block w-full`}
                placeholder={`0.0`}
                type="number"
                // value={}
              />
              <div className=" flex items-center justify-center">
                <img
                  alt="ion logo"
                  className={`w-5 h-5 inline-block mx-1`}
                  src="/img/symbols/32/color/ion.png"
                />
                <button className={` mx-2`}>ION/ETH</button>
              </div>
            </div> */}
            <button
              className={`flex items-center justify-center  py-1.5 mt-8 mb-4 text-sm text-black w-full bg-accent rounded-md`}
              onClick={() => addLiquidity()}
            >
              <img
                alt="lock--v1"
                className={`w-4 h-4 inline-block mx-2`}
                src="https://img.icons8.com/ios/50/lock--v1.png"
              />
              Provide Liquidity
            </button>
          </div>
          <div className={`w-full h-full bg-grayone px-4 rounded-xl py-2`}>
            <h1 className={` text-lg`}>Step 3. Stake your LP</h1>
            <h1 className={`text-[12px] text-white/40 mt-2`}> Stake </h1>
            <div
              className={`flex w-full mt-2 items-center justify-between text-md `}
            >
              <input
                className={`focus:outline-none amount-field font-bold bg-transparent flex-auto block w-full`}
                placeholder={`0.0`}
                type="number"
                // value={}
              />
              <div className=" flex items-center justify-center">
                <img
                  alt="ion logo"
                  className={`w-5 h-5 inline-block mx-1`}
                  src="/img/symbols/32/color/ion.png"
                />
                <button className={` mx-2`}>ION/WETH</button>
              </div>
            </div>
            <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-5" />
            <h1 className={` mt-2`}>You will get </h1>
            {/* this will get repeated */}
            <div className="flex items-center w-full mt-3 text-xs gap-2">
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block mx-1`}
                src="/img/logo/MODE.png"
              />
              <span>Mode Points SZN 2</span>
              <span className="text-accent ml-auto">2x</span>
            </div>
            <div className="flex items-center w-full mt-3 text-xs gap-2">
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block mx-1`}
                src="/img/logo/MODE.png"
              />
              <span>Mode Points SZN 2</span>
              <span className="text-accent ml-auto">2x</span>
            </div>
            <div className="flex items-center w-full mt-3 text-xs gap-2">
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block mx-1`}
                src="/img/logo/MODE.png"
              />
              <span>Mode Points SZN 2</span>
              <span className="text-accent ml-auto">2x</span>
            </div>
            <button
              className={`flex items-center justify-center  py-1.5 mt-6 mb-4 text-sm text-black w-full bg-accent rounded-md`}
              onClick={() => stakingAsset()}
            >
              Stake
            </button>
          </div>
          {/* this will get repeated */}
        </div>
      </div>
    </main>
  );
}

// export default dynamic(() => Promise.resolve(Stake), { ssr: false });
