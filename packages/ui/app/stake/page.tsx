/* eslint-disable @next/next/no-img-element */
'use client';

import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState, useRef, useEffect } from 'react';
import {
  erc20Abi,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits
} from 'viem';
import { base, mode } from 'viem/chains';
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useReadContract,
  useWalletClient
} from 'wagmi';

import NetworkSelector from '../_components/markets/NetworkSelector';
import SliderComponent from '../_components/popup/Slider';
import ResultHandler from '../_components/ResultHandler';
import ClaimRewards from '../_components/stake/ClaimRewards';
import MaxDeposit from '../_components/stake/MaxDeposit';
import Toggle from '../_components/Toggle';

import { lpSugarAbi } from './abi/lpSugar';

import { pools } from '@ui/constants/index';
import { LiquidityContractAbi } from '@ui/constants/lp';
import { StakingContractAbi } from '@ui/constants/staking';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import {
  useAeroPrice,
  useIonPrice,
  useModePrice
} from '@ui/hooks/useDexScreenerPrices';
import {
  getAvailableStakingToken,
  getReservesABI,
  getReservesArgs,
  getReservesContract,
  getSpenderContract,
  getStakingToContract,
  getToken
} from '@ui/utils/getStakingTokens';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

const Widget = dynamic(() => import('../_components/stake/Widget'), {
  ssr: false
});

// import { Widget } from '../_components/stake/Widget';

export default function Stake() {
  const [widgetPopup, setWidgetPopup] = useState<boolean>(false);
  const [rewardPopup, setRewardPopup] = useState<boolean>(false);
  // const [step1Loading, setStep1Loading] = useState<boolean>(false);
  const [step2Loading, setStep2Loading] = useState<boolean>(false);
  const [step3Loading, setStep3Loading] = useState<boolean>(false);
  const [step2Toggle, setstep2Toggle] = useState<string>('');
  const [step3Toggle, setstep3Toggle] = useState<string>('');
  //---------------
  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : String(chainId);
  const [open, setOpen] = useState<boolean>(false);

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [maxDeposit, setMaxDeposit] = useState<{ ion: string; eth: string }>({
    ion: '',
    eth: ''
  });
  const [maxWithdrawl, setMaxWithdrawl] = useState<{
    ion: string;
    eth: string;
  }>({
    ion: '',
    eth: ''
  });
  const [maxLp, setMaxLp] = useState<string>('');
  //---- unstaking states
  const [allStakedAmount, setAllStakedAmount] = useState<string>('');
  const [maxUnstake, setMaxUnstake] = useState<string>('');
  const [utilization, setUtilization] = useState<number>(0);
  const router = useRouter();
  const { data: withdrawalMaxToken } = useBalance({
    address,
    token: getAvailableStakingToken(+chain),
    query: {
      refetchInterval: 6000
    }
  });

  useEffect(() => {
    async function switchin() {
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) {
        router.push(`/stake?chain=${chainId}`);
        return;
      }
      return;
    }
    switchin();
  }, [chain, chainId, router]);

  useMemo(() => {
    if (!maxWithdrawl.ion && !withdrawalMaxToken) return;
    const percent =
      (+maxWithdrawl.ion /
        Number(
          formatUnits(
            withdrawalMaxToken?.value as bigint,
            withdrawalMaxToken?.decimals as number
          )
        )) *
      100;
    setUtilization(Number(percent.toFixed(0)));
  }, [maxWithdrawl.ion, withdrawalMaxToken]);

  useMemo(async () => {
    try {
      const reserves = (await publicClient?.readContract({
        abi: getReservesABI(+chain),
        address: getReservesContract(+chain),
        args: getReservesArgs(+chain),
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
      if (maxWithdrawl.ion && reserves) {
        const ethVal =
          (parseUnits(maxWithdrawl?.ion, 18) * reserves[1]) / reserves[0];
        setMaxWithdrawl((p) => {
          return { ...p, eth: formatEther(ethVal) || '' };
        });
      } else {
        setMaxWithdrawl((p) => {
          return { ...p, eth: '' };
        });
      }
      let getStakedTokens = 0n;
      if (address) {
        getStakedTokens =
          (await publicClient?.readContract({
            abi: StakingContractAbi,
            address: getStakingToContract(+chain),
            args: [address],
            functionName: 'balanceOf'
          })) ?? 0n;
      }
      if (getStakedTokens || step3Loading) {
        step3Loading
          ? setAllStakedAmount(formatEther(getStakedTokens))
          : setAllStakedAmount(formatEther(getStakedTokens));
      } else {
        step3Loading
          ? setAllStakedAmount(formatEther(getStakedTokens))
          : setAllStakedAmount(formatEther(getStakedTokens));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }, [
    address,
    chain,
    maxDeposit.ion,
    maxWithdrawl.ion,
    publicClient,
    step3Loading
  ]);

  async function addLiquidity() {
    try {
      const args = {
        token: getToken(+chain),
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

      const approval = await walletClient!.writeContract({
        abi: erc20Abi,
        account: walletClient?.account,
        address: getToken(+chain),
        args: [getSpenderContract(+chain), args.amountTokenDesired],
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
        address: getSpenderContract(+chain),
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
  async function removeLiquidity() {
    try {
      const args = {
        token: getToken(+chain),
        stable: false,
        liquidity: parseUnits(maxWithdrawl?.ion, 18),
        // amounTokenMin:
        //   parseEther(maxWithdrawl?.ion) -
        //   (parseEther(maxWithdrawl?.ion) * BigInt(5)) / BigInt(100),
        amounTokenMin: parseEther('0'),
        // amountETHMin: parseUnits(maxWithdrawl?.eth, 18),
        amountETHMin: parseEther('0'),
        to: address,
        deadline: Math.floor((Date.now() + 3636000) / 1000)
      };
      // console.log(args);

      if (!isConnected) {
        console.error('Not connected');
        return;
      }

      //approving first ...

      const approval = await walletClient!.writeContract({
        abi: erc20Abi,
        account: walletClient?.account,
        address: getAvailableStakingToken(+chain),
        args: [getSpenderContract(+chain), args.liquidity],
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
        address: getSpenderContract(+chain),
        args: [
          args.token,
          args.stable,
          args.liquidity,
          args.amounTokenMin,
          args.amountETHMin,
          args.to,
          args.deadline
        ],
        functionName: 'removeLiquidityETH'
        // value: parseUnits(maxWithdrawl?.eth, 18)
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
      setMaxWithdrawl((p) => {
        return { ...p, ion: '' };
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      setStep2Loading(false);
      setMaxWithdrawl((p) => {
        return { ...p, ion: '' };
      });
    } finally {
      setStep2Loading(false);
      setMaxWithdrawl((p) => {
        return { ...p, ion: '' };
      });
    }
  }
  async function stakingAsset() {
    try {
      const args = {
        lpToken: parseUnits(maxLp, 18)
      };

      if (!isConnected || !address) {
        console.error('Not connected');
        return;
      }

      if (maxLp == '0') return;

      const approval = await walletClient!.writeContract({
        abi: erc20Abi,
        account: walletClient?.account,
        address: getAvailableStakingToken(+chain),
        args: [getStakingToContract(+chain), args.lpToken],
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
        address: getStakingToContract(+chain),
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
  async function unstakingAsset() {
    try {
      const args = {
        lpToken: parseUnits(maxUnstake, 18)
      };

      if (!isConnected) {
        console.error('Not connected');
        return;
      }
      if (maxLp == '0') return;

      setStep3Loading(true);

      const tx = await walletClient!.writeContract({
        abi: StakingContractAbi,
        account: walletClient?.account,
        address: getStakingToContract(+chain),
        args: [args.lpToken],
        functionName: 'withdraw'
      });
      // eslint-disable-next-line no-console
      console.log('Transaction Hash --->>>', tx);
      if (!tx) return;
      const transaction = await publicClient?.waitForTransactionReceipt({
        hash: tx
      });

      setStep3Loading(false);
      setMaxUnstake('');
      // eslint-disable-next-line no-console
      console.log('Transaction --->>>', transaction);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      setStep3Loading(false);
      setMaxUnstake('');
    } finally {
      setStep3Loading(false);
      setMaxUnstake('');
    }
  }

  const newRef = useRef(null!);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleOutsideClick = (e: any) => {
    //@ts-ignore
    if (newRef.current && !newRef.current?.contains(e?.target)) {
      setOpen(false);
    }
  };

  const ionTokenOfChain = useMemo(() => {
    return getToken(+chain);
  }, [chain]);

  return (
    <main className={``}>
      <div className="w-full flex items-center justify-center py-20 transition-all duration-200 ease-linear bg-black dark:bg-black relative">
        <Widget
          close={() => setWidgetPopup(false)}
          open={widgetPopup}
          chain={+chain}
        />

        <ClaimRewards
          close={() => setRewardPopup(false)}
          open={rewardPopup}
        />

        <div
          className={`md:w-[65%] w-[90%] lg:w-[50%] mx-auto grid grid-cols-2 gap-4`}
        >
          <div
            className={`bg-grayone col-span-2 flex flex-col items-center justify-center py-4 px-8 rounded-xl gap-y-3  col-start-1 row-start-1 `}
          >
            <div className={`flex w-full items-center  justify-between`}>
              <h1 className={` text-lg`}>
                Step 1. Buy
                <img
                  alt="ion logo"
                  className={`w-6 h-6 inline-block mx-1`}
                  src="/img/symbols/32/color/ion.png"
                />
                ION Tokens
              </h1>
              <div className={` xl:w-[30%] w-[40%]`}>
                <NetworkSelector
                  dropdownSelectedChain={Number(chain) as number}
                  newRef={newRef}
                  open={open}
                  setOpen={setOpen}
                  nopool={true}
                  enabledChains={[mode.id, base.id]}
                />
              </div>
            </div>

            <button
              className={` py-1.5 text-sm ${pools[+chain].text} w-full ${pools[+chain].accentbg ?? pools[mode.id].accentbg} rounded-md`}
              onClick={() => setWidgetPopup(true)}
            >
              Buy ION Tokens
            </button>
          </div>
          <div
            className={`w-full min-h-max bg-grayone px-4 rounded-xl py-2 col-start-1 col-span-1 row-start-2 `}
          >
            <h1 className={` text-lg`}>Step 2. LP your ION Tokens</h1>
            <div className={`my-3`}>
              <Toggle setActiveToggle={setstep2Toggle} />
            </div>
            {step2Toggle === 'Deposit' && (
              <>
                <MaxDeposit
                  headerText={step2Toggle}
                  amount={maxDeposit.ion}
                  tokenName={'ion'}
                  token={ionTokenOfChain}
                  handleInput={(val?: string) =>
                    setMaxDeposit((p) => {
                      return { ...p, ion: val || '' };
                    })
                  }
                  chain={+chain}
                />
                <MaxDeposit
                  headerText={step2Toggle}
                  amount={maxDeposit.eth}
                  tokenName={'eth'}
                  token={'0x0000000000000000000000000000000000000000'}
                  chain={+chain}
                />
              </>
            )}
            {step2Toggle === 'Withdraw' && (
              <>
                <MaxDeposit
                  headerText={step2Toggle}
                  amount={maxWithdrawl.ion}
                  tokenName={'ion/eth'}
                  token={getAvailableStakingToken(+chain)}
                  handleInput={(val?: string) =>
                    setMaxWithdrawl((p) => {
                      return { ...p, ion: val || '' };
                    })
                  }
                  chain={+chain}
                />
                {/* <MaxDeposit
                  headerText={step2Toggle}
                  amount={maxWithdrawl.eth}
                  tokenName={'eth'}
                  token={'0x0000000000000000000000000000000000000000'}
                  // max="0"
                /> */}
                <div className={`my-6 w-[95%] mx-auto  `}>
                  <SliderComponent
                    currentUtilizationPercentage={Number(
                      utilization.toFixed(0)
                    )}
                    handleUtilization={(val?: number) => {
                      if (!val && !isConnected) return;
                      const ionval =
                        (Number(val) / 100) *
                        Number(
                          formatUnits(
                            withdrawalMaxToken?.value as bigint,
                            withdrawalMaxToken?.decimals as number
                          )
                        );
                      setMaxWithdrawl((p) => {
                        return { ...p, ion: ionval.toString() || '' };
                      });
                    }}
                  />
                </div>
              </>
            )}

            {/* liner */}

            <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-5" />

            <button
              className={`flex items-center justify-center  py-1.5 mt-8 mb-2 text-sm ${pools[+chain].text} w-full ${pools[+chain].accentbg ?? pools[mode.id].accentbg} ${
                step2Toggle === 'Withdraw' && 'bg-red-500 text-white'
              } rounded-md`}
              onClick={() => {
                step2Toggle === 'Deposit' && addLiquidity();
                step2Toggle === 'Withdraw' && removeLiquidity();
              }}
            >
              <ResultHandler
                isLoading={step2Loading}
                height="20"
                width="20"
                color={'#000000'}
              >
                {step2Toggle === 'Withdraw' ? (
                  'Withdraw Liquidity'
                ) : (
                  <>
                    <img
                      alt="lock--v1"
                      className={`w-4 h-4 inline-block mx-2`}
                      src={`https://img.icons8.com/${+chain === mode.id ? '000000' : 'ffffff'}/ios/50/lock--v1.png`}
                    />
                    Provide Liquidity
                  </>
                )}
              </ResultHandler>
            </button>
          </div>

          <div
            className={`w-full h-min bg-grayone px-4 rounded-xl py-2 row-start-3 col-start-1 col-span-1`}
          >
            <h1 className={` text-lg `}>Claim Your Rewards </h1>
            {/* 
            <MaxDeposit
              tokenName={'ion/eth'}
              token={'0xC6A394952c097004F83d2dfB61715d245A38735a'}
              fetchOwn={true}
            /> */}
            <button
              className={`my-3 py-1.5 text-sm ${pools[+chain].text} w-full ${pools[+chain].accentbg ?? pools[mode.id].accentbg} rounded-md`}
              onClick={() => setRewardPopup(true)}
            >
              Claim Rewards
            </button>
          </div>
          <div
            className={`w-full h-full bg-grayone px-4 rounded-xl py-2 col-start-2 row-start-2 row-span-2`}
          >
            <h1 className={` text-lg`}>Step 3. Stake your LP</h1>
            <div className={`my-3`}>
              <Toggle
                setActiveToggle={setstep3Toggle}
                arrText={['Stake', 'Unstake']}
              />
            </div>
            {/* <h1 className={`text-[12px] text-white/40 mt-2`}> Stake </h1> */}
            {step3Toggle === 'Stake' && (
              <MaxDeposit
                headerText={step3Toggle}
                amount={maxLp}
                tokenName={'ion/eth'}
                token={getAvailableStakingToken(+chain)}
                handleInput={(val?: string) => setMaxLp(val as string)}
                chain={+chain}
              />
            )}
            {step3Toggle === 'Unstake' && (
              <MaxDeposit
                max={allStakedAmount}
                headerText={step3Toggle}
                amount={maxUnstake}
                tokenName={'ion/eth'}
                handleInput={(val?: string) => setMaxUnstake(val as string)}
                chain={+chain}
              />
            )}

            <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-5" />
            <h1 className={` mt-2`}>
              You will {step3Toggle === 'Unstake' && 'not'} get{' '}
            </h1>
            {/* this will get repeated */}
            {+chain === mode.id && <ModeBreakdown step3Toggle={step3Toggle} />}
            {+chain === base.id && <BaseBreakdown step3Toggle={step3Toggle} />}
            <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-5" />
            <button
              className={`flex items-center justify-center  py-1.5 mt-7 mb-3 text-sm ${pools[+chain].text} w-full ${pools[+chain].accentbg ?? pools[mode.id].accentbg} ${
                step3Toggle === 'Unstake' && 'bg-red-500 text-white'
              } rounded-md`}
              onClick={() => {
                step3Toggle === 'Stake' && stakingAsset();
                step3Toggle === 'Unstake' && unstakingAsset();
              }}
            >
              <ResultHandler
                isLoading={step3Loading}
                height="20"
                width="20"
                color={'#000000'}
              >
                {step3Toggle ? step3Toggle : 'Stake'}
              </ResultHandler>
            </button>
          </div>
          {/* this will get repeated */}
        </div>
      </div>
    </main>
  );
}

type ModeBreakdownProps = {
  step3Toggle: string;
};
const ModeBreakdown = ({ step3Toggle }: ModeBreakdownProps) => {
  return (
    <>
      <div className="flex items-center w-full mt-3 text-xs gap-2">
        <img
          alt="ion logo"
          className={`w-6 h-6 inline-block mx-1 bg-blend-screen`}
          src="/img/symbols/32/color/velo.png"
        />
        <VelodromeAPY step3Toggle={step3Toggle} />
      </div>
      <div className="flex items-center w-full mt-3 text-xs gap-2">
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
      </div>
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
          3x
        </span>
      </div>
    </>
  );
};

type VelodromeAPYProps = {
  step3Toggle: string;
};
const VelodromeAPY = ({ step3Toggle }: VelodromeAPYProps) => {
  const LP_SUGAR_ADDRESS = '0x207DfB36A449fd10d9c3bA7d75e76290a0c06731';
  const ION_POOL_INDEX = 6n;
  const { data: sugarData } = useReadContract({
    abi: lpSugarAbi,
    address: LP_SUGAR_ADDRESS,
    args: [ION_POOL_INDEX],
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
              ethPriceData[mode.id].value)) *
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

type BaseBreakdownProps = {
  step3Toggle: string;
};
const BaseBreakdown = ({ step3Toggle }: BaseBreakdownProps) => {
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
      <div className="flex items-center w-full mt-3 text-xs gap-2">
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
      </div>
    </>
  );
};

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
