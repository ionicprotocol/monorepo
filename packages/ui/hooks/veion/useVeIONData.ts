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
  const lpToken = getAvailableStakingToken(chainId, 'eth');

  // Get oracle prices for LP tokens
  const { data: lpTokenPrices } = useOracleBatch([lpToken], chainId);

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

  const optimismTotalLiquidity =
    poolBalances?.slice(3)?.reduce((acc, balance, index) => {
      if (!balance?.result) return acc;
      const value = Number(formatEther(balance.result));
      const price = index === 2 ? ionPrices[10] || 0 : ethPrice;
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

      // Get the appropriate LP token price from oracle
      let lpTokenPrice = 0;
      if (chainId === 8453) {
        // Base chain LP token
        lpTokenPrice = lpTokenPrices?.[lpToken] || 0;
      } else if (chainId === 34443) {
        // Mode chain LP token
        lpTokenPrice =
          lpTokenPrices?.[getAvailableStakingToken(34443, 'eth')] || 0;
      }

      const valueInUsd = amount * (Number(lpTokenPrice) / 1e18);
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

  const optimismLockedValue = calculateChainLockedValue(
    10,
    VEION_CHAIN_CONFIGS[8453].lpTypes.length +
      VEION_CHAIN_CONFIGS[34443].lpTypes.length,
    VEION_CHAIN_CONFIGS[10].lpTypes
  );

  // Calculate staked amounts for each chain
  const baseStakedAmount = stakedAmounts?.[0]?.result
    ? Number(formatEther(stakedAmounts[0].result)) *
      (lpTokenPrices?.[lpToken] ? Number(lpTokenPrices[lpToken]) / 1e18 : 0)
    : 0;

  const modeStakedAmount = stakedAmounts?.[1]?.result
    ? Number(formatEther(stakedAmounts[1].result)) *
      (lpTokenPrices?.[getAvailableStakingToken(34443, 'eth')]
        ? Number(lpTokenPrices[getAvailableStakingToken(34443, 'eth')]) / 1e18
        : 0)
    : 0;

  // const optimismStakedAmount = stakedAmounts?.[2]?.result
  //   ? Number(formatEther(stakedAmounts[2].result)) *
  //     (lpTokenPrices?.[getAvailableStakingToken(10, 'eth')]
  //       ? Number(lpTokenPrices[getAvailableStakingToken(10, 'eth')]) / 1e18
  //       : 0)
  //   : 0;

  return {
    totalLiquidity: {
      8453: baseTotalLiquidity,
      34443: modeTotalLiquidity,
      10: optimismTotalLiquidity
    },
    lockedLiquidity: {
      8453: baseLockedValue,
      34443: modeLockedValue,
      10: optimismLockedValue
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
