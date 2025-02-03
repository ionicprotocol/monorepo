import { formatEther } from 'viem';
import { useReadContracts } from 'wagmi';

import { StakingContractAbi } from '@ui/constants/staking';
import { VEION_CONTRACTS } from '@ui/constants/veIon';
import {
  getAvailableStakingToken,
  getStakingToContract
} from '@ui/utils/getStakingTokens';
import { VEION_CHAIN_CONFIGS } from '@ui/utils/veion/chainConfig';

import {
  LIQUIDITY_POOLS,
  ERC20_BALANCE_ABI
} from '../../utils/getLiquidityTokens';
import { useOracleBatch } from '../ionic/useOracleBatch';
import { useIonPrices } from '../useDexScreenerPrices';
import { useEthPrice } from '../useEthPrice';

import { iveIonAbi } from '@ionicprotocol/sdk';

interface ChainSupplyResult {
  error?: Error;
  result?: bigint;
  status: 'failure' | 'success';
}

export function useVeIonData(chainId: number) {
  const { data: ethPrice = 0 } = useEthPrice();
  const { data: ionPrices = {} } = useIonPrices();
  const lpTokenBase = getAvailableStakingToken(8453, 'eth');
  const lpTokenMode = getAvailableStakingToken(34443, 'eth');

  // Get oracle prices for LP tokens
  const { data: lpTokenPricesBase } = useOracleBatch([lpTokenBase], 8453);
  const { data: lpTokenPriceMode } = useOracleBatch([lpTokenMode], 34443);

  // Get total staked amounts across all chains
  const { data: stakedAmounts, isLoading: stakedAmountLoading } =
    useReadContracts({
      contracts: [
        // Base staked amount
        {
          address: getStakingToContract(8453, 'eth'),
          abi: StakingContractAbi,
          functionName: 'totalSupply',
          chainId: 8453
        },
        // Mode staked amount
        {
          address: getStakingToContract(34443, 'eth'),
          abi: StakingContractAbi,
          functionName: 'totalSupply',
          chainId: 34443
        }
        // Optimism staked amount
        // {
        //   address: getStakingToContract(10, 'eth'),
        //   abi: StakingContractAbi,
        //   functionName: 'totalSupply',
        //   chainId: 10
        // }
      ]
    });

  // Get pool balances for total liquidity calculation
  const { data: poolBalances, isLoading: poolBalanceLoading } =
    useReadContracts({
      contracts: [
        // Base WETH Pool
        {
          address: LIQUIDITY_POOLS.BASE_WETH_POOL.wethAddress,
          abi: ERC20_BALANCE_ABI,
          functionName: 'balanceOf',
          args: [LIQUIDITY_POOLS.BASE_WETH_POOL.lpAddress],
          chainId: LIQUIDITY_POOLS.BASE_WETH_POOL.chainId
        },
        // Mode WETH Pool
        {
          address: LIQUIDITY_POOLS.MODE_WETH_POOL.wethAddress,
          abi: ERC20_BALANCE_ABI,
          functionName: 'balanceOf',
          args: [LIQUIDITY_POOLS.MODE_WETH_POOL.lpAddress],
          chainId: LIQUIDITY_POOLS.MODE_WETH_POOL.chainId
        },
        // Mode ION Pool
        {
          address: LIQUIDITY_POOLS.MODE_ION_POOL.ionAddress,
          abi: ERC20_BALANCE_ABI,
          functionName: 'balanceOf',
          args: [LIQUIDITY_POOLS.MODE_ION_POOL.lpAddress],
          chainId: LIQUIDITY_POOLS.MODE_ION_POOL.chainId
        }
      ]
    });

  // Get locked supplies for all chains and LP types
  const { data: allChainSupplies = [], isLoading: supplyLoading } =
    useReadContracts({
      contracts: [
        // Base chain supplies
        ...VEION_CHAIN_CONFIGS[8453].lpTypes.map((lpType) => ({
          address: VEION_CONTRACTS[8453],
          abi: iveIonAbi,
          functionName: 's_supply',
          args: [BigInt(lpType)],
          chainId: 8453
        })),
        // Mode chain supplies
        ...VEION_CHAIN_CONFIGS[34443].lpTypes.map((lpType) => ({
          address: VEION_CONTRACTS[34443],
          abi: iveIonAbi,
          functionName: 's_supply',
          args: [BigInt(lpType)],
          chainId: 34443
        }))
        // // Optimism chain supplies
        // ...VEION_CHAIN_CONFIGS[10].lpTypes.map((lpType) => ({
        //   address: VEION_CONTRACTS[10],
        //   abi: iveIonAbi,
        //   functionName: 's_supply',
        //   args: [BigInt(lpType)],
        //   chainId: 10
        // }))
      ]
    }) as { data: ChainSupplyResult[]; isLoading: boolean };

  // Calculate total liquidity per chain
  const baseTotalLiquidity = poolBalances?.[0]?.result
    ? Number(formatEther(poolBalances[0].result)) * ethPrice * 2
    : 0;

  const modeTotalLiquidity =
    poolBalances?.slice(1, 3)?.reduce((acc, balance, index) => {
      if (!balance?.result) return acc;
      const value = Number(formatEther(balance.result));
      const price = index === 0 ? ethPrice : ionPrices[34443] || 0;
      return acc + value * price * 2;
    }, 0) || 0;

  // Calculate locked value for each chain using oracle prices
  const calculateChainLockedValue = (
    chainId: number,
    startIndex: number,
    lpTypes: number[]
  ) => {
    return lpTypes.reduce((acc, lpType, index) => {
      const supply = allChainSupplies[startIndex + index];
      if (supply?.status !== 'success' || !supply.result) return acc;

      const amount = Number(formatEther(supply.result));

      // Use the same LP token price calculation as staked amounts
      let valueInUsd = 0;
      if (chainId === 8453) {
        valueInUsd =
          amount *
          Number(formatEther(lpTokenPricesBase?.[lpTokenBase] || 0)) *
          ethPrice;
      } else if (chainId === 34443) {
        valueInUsd =
          amount *
          Number(formatEther(lpTokenPriceMode?.[lpTokenMode] || 0)) *
          ethPrice;
      }

      return acc + valueInUsd;
    }, 0);
  };

  // Calculate locked values using oracle prices
  const baseLockedValue = calculateChainLockedValue(
    8453,
    0,
    VEION_CHAIN_CONFIGS[8453].lpTypes
  );

  const modeLockedValue = calculateChainLockedValue(
    34443,
    VEION_CHAIN_CONFIGS[8453].lpTypes.length,
    VEION_CHAIN_CONFIGS[34443].lpTypes
  );

  // const optimismLockedValue = calculateChainLockedValue(
  //   10,
  //   VEION_CHAIN_CONFIGS[8453].lpTypes.length +
  //     VEION_CHAIN_CONFIGS[34443].lpTypes.length,
  //   VEION_CHAIN_CONFIGS[10].lpTypes
  // );

  // Calculate staked amounts for each chain
  const baseStakedAmount = stakedAmounts?.[0]?.result
    ? Number(formatEther(stakedAmounts[0].result)) *
      Number(formatEther(lpTokenPricesBase?.[lpTokenBase] || 0)) *
      ethPrice
    : 0;

  const modeStakedAmount = stakedAmounts?.[1]?.result
    ? Number(formatEther(stakedAmounts[1].result)) *
      Number(formatEther(lpTokenPriceMode?.[lpTokenMode] || 0)) *
      ethPrice
    : 0;

  return {
    totalLiquidity: {
      8453: baseTotalLiquidity,
      34443: modeTotalLiquidity,
      10: 0
    },
    lockedLiquidity: {
      8453: baseLockedValue,
      34443: modeLockedValue,
      10: 0
    },
    stakedAmount: {
      8453: baseStakedAmount,
      34443: modeStakedAmount,
      10: 0
    },
    isLoading: supplyLoading || stakedAmountLoading || poolBalanceLoading,
    allChainSupplies
  };
}
