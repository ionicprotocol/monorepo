/* eslint-disable @next/next/no-img-element */
'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { erc20Abi, formatEther, parseEther, parseUnits } from 'viem';
import { mode } from 'viem/chains';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient
} from 'wagmi';

import MaxDeposit from '../_components/stake/MaxDeposit';

import { ApprovalAbi, ApprovalContractAddress } from '@ui/constants/approve';
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
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [maxDeposit, setMaxDeposit] = useState<{ ion: string; eth: string }>({
    ion: '',
    eth: ''
  });

  useMemo(async () => {
    try {
      const reserves = (await publicClient?.readContract({
        abi: LiquidityContractAbi,
        address: LiquidityContractAddress,
        args: [
          '0x18470019bf0e94611f15852f7e93cf5d65bc34ca',
          '0x4200000000000000000000000000000000000006',
          false
        ],
        functionName: 'getReserves'
      })) as bigint[];

      if (maxDeposit.ion && reserves) {
        const ethVal =
          (parseUnits(maxDeposit?.ion, 18) * reserves[1]) / reserves[0];
        setMaxDeposit((p) => {
          return { ...p, eth: formatEther(ethVal) || '' };
        });
      } else {
        setMaxDeposit((p) => {
          return { ...p, eth: '' };
        });
      }

      // return gettingReserves;
      // const quoteLiquidity = await publicClient?.readContract({
      //   abi: LiquidityContractAbi,
      //   address: LiquidityContractAddress,
      //   args: [
      //     parseUnits(maxDeposit?.ion, 18),
      //     parseUnits(gettingReserves[0], 18),
      //     parseUnits(gettingReserves[1], 18)
      //   ],
      //   functionName: 'quoteLiquidity'
      // });
      //eslint-disable-next-line no-console
      // console.log(typeof reserves);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }, [maxDeposit.ion, publicClient]);

  async function addLiquidity() {
    try {
      const args = {
        token: '0x18470019bf0e94611f15852f7e93cf5d65bc34ca',
        stable: false,
        amountTokenDesired: parseUnits(maxDeposit?.ion, 18),
        amounTokenMin:
          parseEther(maxDeposit?.ion) -
          (parseEther(maxDeposit?.ion) * BigInt(5)) / BigInt(100),
        amountETHMin: parseUnits(maxDeposit?.eth, 18),
        to: address,
        deadline: Math.floor((Date.now() + 3600000) / 1000)
      };

      if (!isConnected) {
        console.error('Not connected');
        return;
      }
      const switched = await handleSwitchOriginChain(mode.id, chainId);
      if (!switched) return;
      //approving first ...

      const approval = await walletClient!.writeContract({
        abi: erc20Abi,
        account: walletClient?.account,
        address: '0x18470019bf0e94611f15852f7e93cf5d65bc34ca',
        args: [LiquidityContractAddress, args.amountTokenDesired],
        functionName: 'approve'
      });

      // console.log(approval);

      const appr = await publicClient?.waitForTransactionReceipt({
        hash: approval
      });
      // eslint-disable-next-line no-console
      console.log({ appr });

      const tx = await walletClient!.writeContract({
        abi: LiquidityContractAbi,
        account: walletClient?.account,
        address: LiquidityContractAddress,
        args: [
          args.token,
          args.stable,
          args.amountTokenDesired,
          args.amounTokenMin,
          args.amountETHMin,
          args.to,
          args.deadline
        ],
        functionName: 'addLiquidityETH',
        value: parseUnits(maxDeposit?.eth, 18)
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
      // Transaction Hash after running addLiquidityEth after approving --->>> 0xa003f3ef182c2e1ecc7c857b35a76d97ea05ab4fbf1e25037d7c0e5ffdc606a1
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
                className={`w-6 h-6 inline-block mx-1 bg-blend-screen`}
                src="/img/symbols/32/color/velo.png"
              />
              <span>Velodrome APY</span>
              <span className="text-accent ml-auto">35%</span>
            </div>
            <div className="flex items-center w-full mt-3 text-xs gap-2">
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block mx-1`}
                src="/img/logo/ION.png"
              />
              <span>Ionic Points</span>
              <span className="text-accent ml-auto">3x</span>
            </div>
            <div className="flex items-center w-full mt-3 text-xs gap-2">
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block mx-1`}
                src="/img/logo/MODE.png"
              />
              <span>Mode Points</span>
              <span className="text-accent ml-auto">1x</span>
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
