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

export function useVeIonData() {
  const { data: ethPrice = 0 } = useEthPrice();
  const { data: ionPrices = {} } = useIonPrices();
  const lpTokenBase = getAvailableStakingToken(8453, 'eth');
  const lpTokenLisk = getAvailableStakingToken(1135, 'weth');

  // Get oracle prices for LP tokens
  const { data: lpTokenPricesBase } = useOracleBatch([lpTokenBase], 8453);
  const { data: lpTokenPriceLisk } = useOracleBatch([lpTokenLisk], 1135);

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
          address: getStakingToContract(34443, 'mode'),
          abi: StakingContractAbi,
          functionName: 'totalSupply',
          chainId: 34443
        },
        // Lisk staked amount
        {
          address: getStakingToContract(1135, 'weth'),
          abi: StakingContractAbi,
          functionName: 'totalSupply',
          chainId: 1135
        }
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
        // Mode ION Pool only
        {
          address: LIQUIDITY_POOLS.MODE_ION_POOL.ionAddress,
          abi: ERC20_BALANCE_ABI,
          functionName: 'balanceOf',
          args: [LIQUIDITY_POOLS.MODE_ION_POOL.lpAddress],
          chainId: LIQUIDITY_POOLS.MODE_ION_POOL.chainId
        },
        // Lisk WETH Pool
        {
          address: LIQUIDITY_POOLS.LISK_WETH_POOL.wethAddress,
          abi: ERC20_BALANCE_ABI,
          functionName: 'balanceOf',
          args: [LIQUIDITY_POOLS.LISK_WETH_POOL.lpAddress],
          chainId: LIQUIDITY_POOLS.LISK_WETH_POOL.chainId
        },
        // Lisk ION Pool
        {
          address: LIQUIDITY_POOLS.LISK_WETH_POOL.ionAddress,
          abi: ERC20_BALANCE_ABI,
          functionName: 'balanceOf',
          args: [LIQUIDITY_POOLS.LISK_WETH_POOL.lpAddress],
          chainId: LIQUIDITY_POOLS.LISK_WETH_POOL.chainId
        },
        // Lisk LP token total supply
        {
          address: LIQUIDITY_POOLS.LISK_WETH_POOL.lpAddress, // LP token address
          abi: ERC20_BALANCE_ABI, // Same ABI has totalSupply function
          functionName: 'totalSupply',
          chainId: LIQUIDITY_POOLS.LISK_WETH_POOL.chainId
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
        })),
        // Lisk chain supplies
        ...VEION_CHAIN_CONFIGS[1135].lpTypes.map((lpType) => ({
          address: VEION_CONTRACTS[1135],
          abi: iveIonAbi,
          functionName: 's_supply',
          args: [BigInt(lpType)],
          chainId: 1135
        }))
      ]
    }) as { data: ChainSupplyResult[]; isLoading: boolean };

  // Calculate total liquidity per chain
  const baseTotalLiquidity = poolBalances?.[0]?.result
    ? Number(formatEther(poolBalances[0].result)) * ethPrice * 2
    : 0;

  // Modified Mode liquidity calculation - only ION pool
  const modeTotalLiquidity = poolBalances?.[1]?.result
    ? Number(formatEther(poolBalances[1].result)) * (ionPrices[34443] || 0) * 2 // Multiply by 2 since it's a pool with equal values
    : 0;

  // Lisk liquidity calculation - using WETH and ION balances
  // We have WETH balance in poolBalances[2] and ION balance in poolBalances[3]
  const liskWethValue = poolBalances?.[2]?.result
    ? Number(formatEther(poolBalances[2].result)) * ethPrice
    : 0;

  const liskIonValue = poolBalances?.[3]?.result
    ? Number(formatEther(poolBalances[3].result)) * (ionPrices[1135] || 0)
    : 0;

  // Total liquidity is the sum of both sides - this matches Velodrome's TVL calculation
  const liskTotalLiquidity = (liskWethValue + liskIonValue) * 2; // Multiply by 2 to match Velodrome's displayed TVL

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

      let valueInUsd = 0;
      if (chainId === 8453) {
        valueInUsd =
          amount *
          Number(formatEther(lpTokenPricesBase?.[lpTokenBase] || 0)) *
          ethPrice;
      } else if (chainId === 34443) {
        valueInUsd = amount * (ionPrices[34443] || 0); // Use ION price directly for Mode chain
      } else if (chainId === 1135) {
        if (lpTokenPriceLisk && lpTokenPriceLisk[lpTokenLisk]) {
          valueInUsd =
            amount *
            Number(formatEther(lpTokenPriceLisk[lpTokenLisk])) *
            ethPrice;
        } else {
          const lpTotalSupply = poolBalances?.[4]?.result
            ? Number(formatEther(poolBalances[4].result))
            : 0;
          if (lpTotalSupply > 0) {
            valueInUsd = (amount / lpTotalSupply) * liskTotalLiquidity;
          } else {
            valueInUsd = (amount * (ethPrice + (ionPrices[1135] || 0))) / 2;
          }
        }
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

  const liskLockedValue = calculateChainLockedValue(
    1135,
    VEION_CHAIN_CONFIGS[8453].lpTypes.length +
      VEION_CHAIN_CONFIGS[34443].lpTypes.length,
    VEION_CHAIN_CONFIGS[1135].lpTypes
  );

  // Calculate staked amounts for each chain
  const baseStakedAmount = stakedAmounts?.[0]?.result
    ? Number(formatEther(stakedAmounts[0].result)) *
      Number(formatEther(lpTokenPricesBase?.[lpTokenBase] || 0)) *
      ethPrice
    : 0;

  const modeStakedAmount = stakedAmounts?.[1]?.result
    ? Number(formatEther(stakedAmounts[1].result)) * (ionPrices[34443] || 0)
    : 0;

  const liskStakedAmount = stakedAmounts?.[2]?.result
    ? Number(formatEther(stakedAmounts[2].result))
    : 0;

  return {
    totalLiquidity: {
      8453: baseTotalLiquidity,
      34443: modeTotalLiquidity,
      10: 0,
      1135: liskTotalLiquidity
    },
    lockedLiquidity: {
      8453: baseLockedValue,
      34443: modeLockedValue,
      10: 0,
      1135: liskLockedValue
    },
    stakedAmount: {
      8453: baseStakedAmount,
      34443: modeStakedAmount,
      10: 0,
      1135: liskStakedAmount
    },
    isLoading: supplyLoading || stakedAmountLoading || poolBalanceLoading,
    allChainSupplies
  };
}
