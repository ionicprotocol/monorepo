/* eslint-disable @next/next/no-img-element */
'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
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

// import NetworkSelector from '../_components/markets/NetworkSelector';
const NetworkSelector = dynamic(
  () => import('../_components/markets/NetworkSelector'),
  {
    ssr: false
  }
);
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
  getPoolToken,
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
  const queryToken = searchParams.get('token');
  const selectedtoken = queryToken ?? 'eth';
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
  // const [allStakedAmount, setAllStakedAmount] = useState<string>('');
  const [maxUnstake, setMaxUnstake] = useState<string>('');
  const [utilization, setUtilization] = useState<number>(0);
  // const router = useRouter();
  const { data: withdrawalMaxToken } = useBalance({
    address,
    token: getAvailableStakingToken(
      +chain,
      selectedtoken as 'eth' | 'mode' | 'weth'
    ),
    chainId: +chain,
    query: {
      // refetchInterval: 6000
      notifyOnChangeProps: ['data', 'error']
    }
  });

  useMemo(() => {
    if (!maxWithdrawl.ion || !withdrawalMaxToken) return;
    const percent =
      (+maxWithdrawl.ion /
        Number(
          formatUnits(
            withdrawalMaxToken.value as bigint,
            withdrawalMaxToken.decimals as number
          )
        )) *
      100;
    setUtilization(Number(percent.toFixed(0)));
  }, [maxWithdrawl.ion, withdrawalMaxToken]);

  const reserves = useReadContract({
    abi: getReservesABI(+chain),
    address: getReservesContract(+chain),
    args: getReservesArgs(+chain, selectedtoken as 'eth' | 'mode' | 'weth'),
    functionName: 'getReserves',
    chainId: +chain,
    query: {
      enabled: true,
      gcTime: Infinity,
      notifyOnChangeProps: ['data', 'error'],
      placeholderData: [0n, 0n]
      // refetchInterval: 5000
    }
  });
  // console.log(reserves);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function calculateReserves(ion: string, data: [bigint, bigint]) {
    if (ion && data) {
      const ethVal = (parseUnits(maxDeposit?.ion, 18) * data[1]) / data[0];
      return formatEther(ethVal);
    } else {
      return '0';
    }
  }

  useMemo(() => {
    const data = (reserves?.data as [bigint, bigint]) ?? [0n, 0n];
    // console.log(data, reserves.data);

    if (
      reserves.status === 'success' &&
      data[0] > 0n &&
      (maxDeposit.ion ?? '0')
    ) {
      const deposits = calculateReserves(
        maxDeposit.ion,
        data as [bigint, bigint]
      );
      setMaxDeposit((p) => ({ ...p, eth: deposits }));
    } else {
      setMaxDeposit((p) => ({ ...p, eth: '' }));
      console.warn('Error while fetching Reserves or insert ionAmount');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxDeposit.ion, reserves.status, reserves?.data]);

  const allStakedAmount = useReadContract({
    abi: StakingContractAbi,
    address: getStakingToContract(
      +chain,
      selectedtoken as 'eth' | 'mode' | 'weth'
    ),
    args: [address as `0x${string}`],
    functionName: 'balanceOf',
    chainId: +chain,
    query: {
      enabled: true,
      gcTime: Infinity,
      notifyOnChangeProps: ['data', 'error'],
      placeholderData: 0n
      // refetchInterval: 4000
    }
  });

  async function addLiquidity() {
    try {
      const args = {
        tokenA: getToken(+chain),
        tokenB: getPoolToken(selectedtoken as 'eth' | 'mode' | 'weth'),
        stable: false,
        amountTokenADesired: parseUnits(maxDeposit?.ion, 18),
        amounTokenAMin:
          parseEther(maxDeposit?.ion) -
          (parseEther(maxDeposit?.ion) * BigInt(5)) / BigInt(100),
        amountTokenBDesired: parseUnits(maxDeposit?.eth, 18),
        amounTokenBMin:
          parseEther(maxDeposit?.eth) -
          (parseEther(maxDeposit?.eth) * BigInt(5)) / BigInt(100),
        to: address,
        deadline: Math.floor((Date.now() + 3600000) / 1000)
      };

      if (!isConnected) {
        console.error('Not connected');
        return;
      }
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) return;
      const approvalA = await walletClient!.writeContract({
        abi: erc20Abi,
        account: walletClient?.account,
        address: args.tokenA,
        args: [getSpenderContract(+chain), args.amountTokenADesired],
        functionName: 'approve'
      });

      if (selectedtoken !== 'eth') {
        const approvalB = await walletClient!.writeContract({
          abi: erc20Abi,
          account: walletClient?.account,
          address: args.tokenB,
          args: [getSpenderContract(+chain), args.amountTokenBDesired],
          functionName: 'approve'
        });
        await publicClient?.waitForTransactionReceipt({
          hash: approvalB
        });
      }
      setStep2Loading(true);
      // console.log(approval);

      const apprA = await publicClient?.waitForTransactionReceipt({
        hash: approvalA
      });

      // eslint-disable-next-line no-console
      console.log({ apprA });

      if (selectedtoken !== 'eth') {
        const tx = await walletClient!.writeContract({
          abi: LiquidityContractAbi,
          account: walletClient?.account,
          address: getSpenderContract(+chain),
          args: [
            args.tokenA,
            args.tokenB,
            args.stable,
            args.amountTokenADesired,
            args.amountTokenBDesired,
            args.amounTokenAMin,
            args.amounTokenBMin,
            args.to,
            args.deadline
          ],
          functionName: 'addLiquidity'
          // value: parseUnits(maxDeposit?.eth, 18)
        });
        // eslint-disable-next-line no-console
        console.log('Transaction Hash --->>>', tx);
        if (!tx) return;
        const transaction = await publicClient?.waitForTransactionReceipt({
          hash: tx
        });
        // eslint-disable-next-line no-console
        console.log('Transaction --->>>', transaction);
      }

      if (selectedtoken === 'eth') {
        const tx = await walletClient!.writeContract({
          abi: LiquidityContractAbi,
          account: walletClient?.account,
          address: getSpenderContract(+chain),
          args: [
            args.tokenA,
            args.stable,
            args.amountTokenADesired,
            args.amounTokenAMin,
            args.amountTokenBDesired,
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
      }
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
        tokenB: getPoolToken(selectedtoken as 'eth' | 'mode' | 'weth'),
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
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) return;

      if (!isConnected) {
        console.error('Not connected');
        return;
      }

      //approving first ...

      const approval = await walletClient!.writeContract({
        abi: erc20Abi,
        account: walletClient?.account,
        address: getAvailableStakingToken(
          +chain,
          selectedtoken as 'eth' | 'mode' | 'weth'
        ),
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

      if (selectedtoken === 'eth') {
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
      }

      if (selectedtoken !== 'eth') {
        const tx = await walletClient!.writeContract({
          abi: LiquidityContractAbi,
          account: walletClient?.account,
          address: getSpenderContract(+chain),
          args: [
            args.token,
            args.tokenB,
            args.stable,
            args.liquidity,
            args.amounTokenMin,
            args.amountETHMin,
            args.to,
            args.deadline
          ],
          functionName: 'removeLiquidity'
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
      }
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
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) return;

      if (maxLp == '0') return;

      const approval = await walletClient!.writeContract({
        abi: erc20Abi,
        account: walletClient?.account,
        address: getAvailableStakingToken(
          +chain,
          selectedtoken as 'eth' | 'mode' | 'weth'
        ),
        args: [
          getStakingToContract(
            +chain,
            selectedtoken as 'eth' | 'mode' | 'weth'
          ),
          args.lpToken
        ],
        functionName: 'approve'
      });

      setStep3Loading(true);
      const appr = await publicClient?.waitForTransactionReceipt({
        hash: approval
      });
      // eslint-disable-next-line no-console
      console.log({ appr });
      // console.log(args.lpToken, getStakingToContract(+chain));
      const tx = await walletClient!.writeContract({
        abi: StakingContractAbi,
        account: walletClient?.account,
        address: getStakingToContract(
          +chain,
          selectedtoken as 'eth' | 'mode' | 'weth'
        ),
        args: [args.lpToken, address],
        functionName: 'deposit'
      });
      // 0x8EE410cC13948e7e684ebACb36b552e2c2A125fC
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
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) return;

      if (maxLp == '0') return;

      setStep3Loading(true);

      const tx = await walletClient!.writeContract({
        abi: StakingContractAbi,
        account: walletClient?.account,
        address: getStakingToContract(
          +chain,
          selectedtoken as 'eth' | 'mode' | 'weth'
        ),
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

  const tokenArrOfChain: Record<number, string[]> = {
    34443: ['eth', 'weth', 'mode'],
    8453: ['eth', 'weth']
  };

  // console.log(tokenArrOfChain[+chain]);
  return (
    <main className={``}>
      <div className="w-full flex items-center justify-center md:py-20 py-8 transition-all duration-200 ease-linear bg-black dark:bg-black relative">
        <Widget
          close={() => setWidgetPopup(false)}
          open={widgetPopup}
          chain={+chain}
        />

        <ClaimRewards
          close={() => setRewardPopup(false)}
          open={rewardPopup}
          chain={chain}
          selectedtoken={selectedtoken as 'eth' | 'mode' | 'weth'}
        />

        <div
          className={`md:w-[65%] w-[90%] lg:w-[50%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4`}
        >
          <div
            className={`bg-grayone md:col-span-2 flex flex-col items-center justify-center py-4 md:px-8 px-4 rounded-xl gap-y-3  md:col-start-1 md:row-start-1 `}
          >
            <div className={`flex w-full items-center   justify-between`}>
              <h1 className={` md:text-lg text-md `}>
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
                  dropdownSelectedChain={+chain}
                  newRef={newRef}
                  open={open}
                  setOpen={setOpen}
                  nopool={true}
                  enabledChains={[mode.id, base.id]}
                />
              </div>
            </div>
            <button
              className={` py-1.5 text-sm ${chain && pools[+chain].text} w-full ${(chain && pools[+chain].accentbg) ?? pools[mode.id].accentbg} rounded-md`}
              onClick={() => setWidgetPopup(true)}
            >
              Buy ION Tokens
            </button>
          </div>
          <div
            className={`w-full min-h-max bg-grayone px-4 rounded-xl py-2 md:col-start-1 md:col-span-1 md:row-start-2 `}
          >
            <h1 className={` md:text-lg text-md`}>
              Step 2. LP your ION Tokens
            </h1>
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
                  tokenName={selectedtoken ?? 'eth'}
                  token={getPoolToken(selectedtoken as 'eth' | 'mode' | 'weth')}
                  chain={+chain}
                  tokenSelector={true}
                  tokenArr={tokenArrOfChain[+chain]}
                />
              </>
            )}
            {step2Toggle === 'Withdraw' && (
              <>
                <MaxDeposit
                  headerText={step2Toggle}
                  amount={maxWithdrawl.ion}
                  tokenName={`ion/${selectedtoken}`}
                  token={getAvailableStakingToken(
                    +chain,
                    selectedtoken as 'eth' | 'mode' | 'weth'
                  )}
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
                          formatEther(
                            withdrawalMaxToken?.value as bigint
                            // withdrawalMaxToken?.decimals as number
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
              disabled={
                (step2Toggle === 'Deposit' &&
                  (maxDeposit.ion === '' || maxDeposit.ion === '0')) ||
                (step2Toggle === 'Withdraw' &&
                  (maxWithdrawl.ion === '' || maxWithdrawl.ion === '0'))
                  ? true
                  : false
              }
              className={`flex items-center justify-center  py-1.5 mt-8 mb-2 text-sm disabled:opacity-80 ${pools[+chain].text} w-full ${pools[+chain].accentbg ?? pools[mode.id].accentbg} ${
                step2Toggle === 'Withdraw' && 'bg-red-500  text-white'
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
            className={`w-full h-min bg-grayone px-4 rounded-xl py-2 md:row-start-3 row-start-4 md:col-start-1 md:col-span-1`}
          >
            <h1 className={` md:text-lg text-md `}>Claim Your Rewards </h1>
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
            className={`w-full h-full bg-grayone px-4 rounded-xl py-2 md:col-start-2 md:row-start-2 md:row-span-2`}
          >
            <h1 className={` md:text-lg text-md`}>Step 3. Stake your LP</h1>
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
                tokenName={`ion/${selectedtoken}`}
                token={getAvailableStakingToken(
                  +chain,
                  selectedtoken as 'eth' | 'mode' | 'weth'
                )}
                handleInput={(val?: string) => setMaxLp(val as string)}
                chain={+chain}
              />
            )}
            {step3Toggle === 'Unstake' && (
              <MaxDeposit
                max={
                  allStakedAmount.status === 'success'
                    ? formatEther(allStakedAmount?.data as bigint)
                    : '0'
                }
                headerText={step3Toggle}
                amount={maxUnstake}
                tokenName={`ion/${selectedtoken}`}
                handleInput={(val?: string) => setMaxUnstake(val as string)}
                chain={+chain}
              />
            )}

            <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-5" />
            <h1 className={`text-end text-[11px] text-white/40 mt-2`}>
              Total Staked :{' '}
              {Number(
                allStakedAmount.status === 'success'
                  ? formatEther(allStakedAmount?.data as bigint)
                  : '0'
              ).toLocaleString('en-US', {
                maximumFractionDigits: 3
              })}{' '}
              ION/{selectedtoken.toUpperCase()}
            </h1>
            <h1 className={` mt-1`}>
              You will {step3Toggle === 'Unstake' && 'not'} get{' '}
            </h1>
            {/* this will get repeated */}
            {+chain === mode.id && (
              <ModeBreakdown
                step3Toggle={step3Toggle}
                selectedtoken={selectedtoken as 'eth' | 'mode' | 'weth'}
              />
            )}
            {+chain === base.id && <BaseBreakdown step3Toggle={step3Toggle} />}
            <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-5" />
            <button
              disabled={
                (step3Toggle === 'Stake' && (maxLp === '' || maxLp === '0')) ||
                (step3Toggle === 'Unstake' &&
                  (maxUnstake === '' || maxUnstake === '0'))
                  ? true
                  : false
              }
              className={`flex disabled:opacity-80   items-center justify-center  py-1.5 mt-7 mb-3 text-sm ${pools[+chain].text} w-full ${pools[+chain].accentbg ?? pools[mode.id].accentbg} ${
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
  selectedtoken: 'eth' | 'mode' | 'weth';
};
const ModeBreakdown = ({ step3Toggle, selectedtoken }: ModeBreakdownProps) => {
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
          {selectedtoken === 'mode' ? '5x' : '3x'}
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
