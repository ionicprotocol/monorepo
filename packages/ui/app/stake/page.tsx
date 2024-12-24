/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';

import {
  erc20Abi,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits
} from 'viem';
import { base, mode, optimism } from 'viem/chains';
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useReadContract,
  useWalletClient
} from 'wagmi';

import { pools } from '@ui/constants/index';
import { LiquidityContractAbi } from '@ui/constants/lp';
import { StakingContractAbi } from '@ui/constants/staking';
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

import SliderComponent from '../../components/dialogs/manage/Slider';
import MaxDeposit from '../../components/MaxDeposit';
import ResultHandler from '../../components/ResultHandler';
import ClaimRewards from '../../components/stake/ClaimRewards';
import RewardDisplay from '../../components/stake/RewardDisplay';
import Toggle from '../../components/Toggle';

const NetworkSelector = dynamic(
  () => import('../../components/markets/NetworkSelector'),
  {
    ssr: false
  }
);

const Widget = dynamic(() => import('../../components/stake/Widget'), {
  ssr: false
});

export default function Stake() {
  const [widgetPopup, setWidgetPopup] = useState<boolean>(false);
  const [rewardPopup, setRewardPopup] = useState<boolean>(false);
  const [step2Loading, setStep2Loading] = useState<boolean>(false);
  const [step3Loading, setStep3Loading] = useState<boolean>(false);
  const [step2Toggle, setstep2Toggle] = useState<string>('');
  const [step3Toggle, setstep3Toggle] = useState<string>('');
  //---------------
  const chainId = useChainId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const queryToken = searchParams.get('token');
  const chain = querychain ? querychain : String(chainId);
  const previousChain = useRef<string>();

  const getDefaultToken = (chain: string) => {
    return chain === String(mode.id) ? 'mode' : 'eth';
  };
  const selectedtoken =
    queryToken ?? getDefaultToken(querychain ?? String(chainId));

  const stakingContractAddress = getStakingToContract(
    +chain,
    selectedtoken as 'eth' | 'mode' | 'weth'
  );
  const stakingTokenAddress = getAvailableStakingToken(
    +chain,
    selectedtoken as 'eth' | 'mode' | 'weth'
  );

  function resetAllInputs() {
    setMaxDeposit({ ion: '', eth: '' });
    setMaxWithdrawl({ ion: '', eth: '' });
    setUtilization(0);
    setMaxLp('');
    setMaxUnstake('');
  }

  useEffect(() => {
    resetAllInputs();
  }, [step2Toggle, step3Toggle, chain]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const currentChain = querychain ?? String(chainId);
    let shouldUpdate = false;

    const isChainChange = previousChain.current !== currentChain;
    previousChain.current = currentChain;

    const currentToken = params.get('token');

    if ((!currentToken && currentChain) || (isChainChange && currentChain)) {
      const defaultToken = currentChain === String(mode.id) ? 'mode' : 'eth';

      if (currentToken !== defaultToken) {
        params.set('token', defaultToken);
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [chainId, querychain, router, searchParams]);

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
  const [maxUnstake, setMaxUnstake] = useState<string>('');
  const [utilization, setUtilization] = useState<number>(0);
  const { data: withdrawalMaxToken } = useBalance({
    address,
    token: stakingTokenAddress,
    chainId: +chain,
    query: {
      notifyOnChangeProps: ['data', 'error']
    }
  });

  const reserves = useReadContract({
    abi: getReservesABI(+chain),
    address: getReservesContract(+chain),
    args: getReservesArgs(+chain, selectedtoken as 'eth' | 'mode' | 'weth'),
    functionName: 'getReserves',
    chainId: +chain,
    query: {
      enabled: true,
      notifyOnChangeProps: ['data', 'error'],
      placeholderData: [0n, 0n]
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function calculateReserves(ion: string, data: [bigint, bigint]) {
    if (ion && data) {
      const ethVal = (parseUnits(ion, 18) * data[1]) / data[0];
      return formatEther(ethVal);
    } else {
      return '0';
    }
  }

  useMemo(() => {
    let data: [bigint, bigint] = [0n, 0n];

    if (reserves.status === 'success' && reserves.data) {
      const resData = reserves.data as
        | [bigint, bigint, bigint]
        | [bigint, bigint];

      if (chain === '10') {
        // For Optimism, reserves are [WETH, ION], so we swap them
        data = [resData[1], resData[0]] as [bigint, bigint];
      } else {
        // For other chains, reserves are already in [ION, ETH] order
        data = resData as [bigint, bigint];
      }
    }

    if (data[0] > 0n && (maxDeposit.ion ?? '0')) {
      const deposits = calculateReserves(maxDeposit.ion, data);
      setMaxDeposit((p) => ({ ...p, eth: deposits }));
    } else {
      setMaxDeposit((p) => ({ ...p, eth: '' }));
      console.warn('Error while fetching Reserves or insert ionAmount');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reserves.status, reserves.data, maxDeposit.ion, chain]);

  const allStakedAmount = useReadContract({
    abi: StakingContractAbi,
    address: stakingContractAddress,
    args: [address as `0x${string}`],
    functionName: 'balanceOf',
    chainId: +chain,
    query: {
      enabled: true,
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
        address: stakingTokenAddress,
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
        address: stakingTokenAddress,
        args: [stakingContractAddress, args.lpToken],
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
        address: stakingContractAddress,
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
        address: stakingContractAddress,
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

  const ionTokenOfChain = useMemo(() => {
    return getToken(+chain);
  }, [chain]);

  const tokenArrOfChain: Record<number, string[]> = {
    34443: ['eth', 'weth', 'mode'],
    8453: ['eth', 'weth'],
    10: ['eth', 'weth']
  };

  return (
    <main>
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

        <div className="md:w-[65%] w-[90%] lg:w-[50%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-grayone md:col-span-2 flex flex-col items-center justify-center py-4 md:px-8 px-4 rounded-xl gap-y-3 md:col-start-1 md:row-start-1">
            <div className="flex w-full items-center justify-between">
              <h1 className="md:text-lg text-md">
                Step 1. Buy
                <img
                  alt="ion logo"
                  className="w-6 h-6 inline-block mx-1"
                  src="/img/symbols/32/color/ion.png"
                />
                ION Tokens
              </h1>
              <div>
                <NetworkSelector
                  dropdownSelectedChain={+chain}
                  nopool={true}
                  enabledChains={[mode.id, base.id, optimism.id]}
                />
              </div>
            </div>
            <button
              type="button"
              className={`py-1.5 text-sm ${chain && pools[+chain].text} w-full ${
                (chain && pools[+chain].accentbg) ?? pools[mode.id].accentbg
              } rounded-md`}
              onClick={() => setWidgetPopup(true)}
            >
              Buy ION Tokens
            </button>
          </div>
          <div className="w-full min-h-max bg-grayone px-4 rounded-xl py-2 md:col-start-1 md:col-span-1 md:row-start-2">
            <h1 className="md:text-lg text-md">Step 2. LP Your ION Tokens</h1>
            <div className="my-3">
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
                  tokenName={selectedtoken}
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
                  token={stakingTokenAddress}
                  handleInput={(val?: string) =>
                    setMaxWithdrawl((p) => {
                      return { ...p, ion: val || '' };
                    })
                  }
                  chain={+chain}
                />
                <div className="my-6 w-[95%] mx-auto">
                  <SliderComponent
                    currentUtilizationPercentage={Number(
                      utilization.toFixed(0)
                    )}
                    handleUtilization={(val?: number) => {
                      if (!val && !isConnected) return;
                      const ionval =
                        (Number(val) / 100) *
                        Number(
                          formatEther(withdrawalMaxToken?.value as bigint)
                        );
                      setMaxWithdrawl((p) => {
                        return { ...p, ion: ionval.toString() || '' };
                      });
                    }}
                  />
                </div>
              </>
            )}

            <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-5" />

            <button
              disabled={
                (step2Toggle === 'Deposit' &&
                  (maxDeposit.ion === '' || maxDeposit.ion === '0')) ||
                (step2Toggle === 'Withdraw' &&
                  (maxWithdrawl.ion === '' || maxWithdrawl.ion === '0'))
              }
              className={`flex items-center justify-center py-1.5 mt-8 mb-2 text-sm disabled:opacity-80 ${pools[+chain].text} w-full ${pools[+chain].accentbg ?? pools[mode.id].accentbg} ${
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
                      className="w-4 h-4 inline-block mx-2"
                      src={`https://img.icons8.com/${+chain === mode.id ? '000000' : 'ffffff'}/ios/50/lock--v1.png`}
                    />
                    Provide Liquidity
                  </>
                )}
              </ResultHandler>
            </button>
          </div>

          <div className="w-full h-min bg-grayone px-4 rounded-xl py-2 md:row-start-3 row-start-4 md:col-start-1 md:col-span-1">
            <h1 className="md:text-lg text-md">Claim Your Rewards</h1>
            <button
              className={`my-3 py-1.5 text-sm ${pools[+chain].text} w-full ${pools[+chain].accentbg ?? pools[mode.id].accentbg} rounded-md`}
              onClick={() => setRewardPopup(true)}
            >
              Claim Rewards
            </button>
          </div>
          <div className="w-full h-full bg-grayone px-4 rounded-xl py-2 md:col-start-2 md:row-start-2 md:row-span-2 flex flex-col">
            <h1 className="md:text-lg text-md">Step 3. Stake Your LP</h1>
            <div className="my-3">
              <Toggle
                setActiveToggle={setstep3Toggle}
                arrText={['Stake', 'Unstake']}
              />
            </div>
            {step3Toggle === 'Stake' && (
              <MaxDeposit
                headerText={step3Toggle}
                amount={maxLp}
                tokenName={`ion/${selectedtoken}`}
                token={stakingTokenAddress}
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
            <h1 className="text-end text-[11px] text-white/40 mt-2">
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
            <h1 className="mt-1">
              You will {step3Toggle === 'Unstake' && 'not'} receive{' '}
              {+chain === base.id ? 'AERO' : 'xVELO'}
            </h1>

            {/* breakdowns */}
            {(+chain === mode.id ||
              +chain === optimism.id ||
              +chain === base.id) && (
              <RewardDisplay
                chainId={+chain}
                isUnstaking={step3Toggle === 'Unstake'}
                selectedToken={selectedtoken as 'eth' | 'mode' | 'weth'}
              />
            )}
            <div className="h-[2px] w-[95%] mx-auto bg-white/10 mt-auto" />
            <button
              disabled={
                (step3Toggle === 'Stake' && (maxLp === '' || maxLp === '0')) ||
                (step3Toggle === 'Unstake' &&
                  (maxUnstake === '' || maxUnstake === '0'))
              }
              className={`flex disabled:opacity-80 items-center justify-center py-1.5 mt-7 mb-3 text-sm ${pools[+chain].text} w-full ${pools[+chain].accentbg ?? pools[mode.id].accentbg} ${
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
        </div>
      </div>
    </main>
  );
}
