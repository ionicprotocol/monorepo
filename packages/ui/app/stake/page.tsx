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

import ResultHandler from '../_components/ResultHandler';
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
  // const [step1Loading, setStep1Loading] = useState<boolean>(false);
  const [step2Loading, setStep2Loading] = useState<boolean>(false);
  const [step3Loading, setStep3Loading] = useState<boolean>(false);

  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [maxDeposit, setMaxDeposit] = useState<{ ion: string; eth: string }>({
    ion: '',
    eth: ''
  });
  const [maxLp, setMaxLp] = useState<string>('');

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
      setStep2Loading(true);
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
      setStep2Loading(false);
      setMaxDeposit((p) => {
        return { ...p, ion: '' };
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      setStep2Loading(false);
      setMaxDeposit((p) => {
        return { ...p, ion: '' };
      });
    } finally {
      setStep2Loading(false);
      setMaxDeposit((p) => {
        return { ...p, ion: '' };
      });
    }
  }

  async function stakingAsset() {
    try {
      const args = {
        lpToken: parseUnits(maxLp, 18)
      };

      if (!isConnected) {
        console.error('Not connected');
        return;
      }
      const switched = await handleSwitchOriginChain(mode.id, chainId);
      if (!switched && maxLp == '0') return;

      const approval = await walletClient!.writeContract({
        abi: erc20Abi,
        account: walletClient?.account,
        address: '0xC6A394952c097004F83d2dfB61715d245A38735a',
        args: [StakingContractAddress, args.lpToken],
        functionName: 'approve'
      });

      setStep3Loading(true);
      const appr = await publicClient?.waitForTransactionReceipt({
        hash: approval
      });
      // eslint-disable-next-line no-console
      console.log({ appr });

      const tx = await walletClient!.writeContract({
        abi: StakingContractAbi,
        account: walletClient?.account,
        address: StakingContractAddress,
        args: [args.lpToken, address],
        functionName: 'deposit'
      });
      // eslint-disable-next-line no-console
      console.log('Transaction Hash --->>>', tx);
      if (!tx) return;
      const transaction = await publicClient?.waitForTransactionReceipt({
        hash: tx
      });

      setStep3Loading(false);
      setMaxLp('');
      // eslint-disable-next-line no-console
      console.log('Transaction --->>>', transaction);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      setStep3Loading(false);
      setMaxLp('');
    } finally {
      setStep3Loading(false);
      setMaxLp('');
    }
  }

  return (
    <main className={``}>
      <div className="w-full flex items-center justify-center py-20 transition-all duration-200 ease-linear bg-black dark:bg-black relative">
        <Widget
          close={() => setWidgetPopup(false)}
          open={widgetPopup}
        />

        <div
          className={`md:w-[65%] w-[90%] lg:w-[50%] mx-auto grid grid-cols-2 gap-4`}
        >
          <div
            className={`bg-grayone col-span-2 flex flex-col items-center justify-center py-4 px-8 rounded-xl gap-y-3  col-start-1 row-start-1 `}
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
          <div
            className={`w-full h-max bg-grayone px-4 rounded-xl py-2 col-start-1 col-span-1 row-start-2 `}
          >
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

            <button
              className={`flex items-center justify-center  py-1.5 mt-8 mb-4 text-sm text-black w-full bg-accent rounded-md`}
              onClick={() => addLiquidity()}
            >
              <ResultHandler
                isLoading={step2Loading}
                height="20"
                width="20"
                color={'#000000'}
              >
                <img
                  alt="lock--v1"
                  className={`w-4 h-4 inline-block mx-2`}
                  src="https://img.icons8.com/ios/50/lock--v1.png"
                />
                Provide Liquidity
              </ResultHandler>
            </button>
          </div>

          <div
            className={`w-full h-min bg-grayone px-4 rounded-xl py-6 row-start-3 col-start-1 col-span-1`}
          >
            <h1 className={` text-lg`}>Available to stake</h1>
            <MaxDeposit
              tokenName={'ion/eth'}
              token={'0xC6A394952c097004F83d2dfB61715d245A38735a'}
              fetchOwn={true}
            />
          </div>
          <div
            className={`w-full h-full bg-grayone px-4 rounded-xl py-2 col-start-2 row-start-2 row-span-2`}
          >
            <h1 className={` text-lg`}>Step 3. Stake your LP</h1>
            <h1 className={`text-[12px] text-white/40 mt-2`}> Stake </h1>
            <MaxDeposit
              amount={maxLp}
              tokenName={'ion/eth'}
              token={'0xC6A394952c097004F83d2dfB61715d245A38735a'}
              handleInput={(val?: string) => setMaxLp(val as string)}
            />
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
              <span className="text-accent ml-auto">-</span>
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
              <span className="text-accent ml-auto">2x</span>
            </div>
            <button
              className={`flex items-center justify-center  py-1.5 mt-6 mb-4 text-sm text-black w-full bg-accent rounded-md`}
              onClick={() => stakingAsset()}
            >
              <ResultHandler
                isLoading={step3Loading}
                height="20"
                width="20"
                color={'#000000'}
              >
                Stake
              </ResultHandler>
            </button>
          </div>
          {/* this will get repeated */}
        </div>
      </div>
    </main>
  );
}

// export default dynamic(() => Promise.resolve(Stake), { ssr: false });
