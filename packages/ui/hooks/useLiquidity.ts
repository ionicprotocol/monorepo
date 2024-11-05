// hooks/useLiquidity.ts
import { formatEther } from 'viem';
import { useReadContracts } from 'wagmi';

import { useEthPrice } from './useEthPrice';
import {
  LIQUIDITY_POOLS,
  ERC20_BALANCE_ABI,
  LP_TYPES
} from '../utils/getLiquidityTokens';

import type { Address } from 'viem';

import { veIonAbi } from '@ionicprotocol/sdk';
type LPType = (typeof LP_TYPES)[number];

interface StakedLiquidityProps {
  address?: Address;
  veIonContract: Address;
}

export function useTotalLiquidity(ethPrice: number, ionPrice: number) {
  const { data: poolBalances } = useReadContracts({
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
      },
      // Optimism WETH Pool
      {
        address: LIQUIDITY_POOLS.OP_WETH_POOL.wethAddress,
        abi: ERC20_BALANCE_ABI,
        functionName: 'balanceOf',
        args: [LIQUIDITY_POOLS.OP_WETH_POOL.lpAddress],
        chainId: LIQUIDITY_POOLS.OP_WETH_POOL.chainId
      },
      // Optimism Dual Pool WETH
      {
        address: LIQUIDITY_POOLS.OP_DUAL_POOL.wethAddress,
        abi: ERC20_BALANCE_ABI,
        functionName: 'balanceOf',
        args: [LIQUIDITY_POOLS.OP_DUAL_POOL.lpAddress],
        chainId: LIQUIDITY_POOLS.OP_DUAL_POOL.chainId
      },
      // Optimism Dual Pool ION
      {
        address: LIQUIDITY_POOLS.OP_DUAL_POOL.ionAddress,
        abi: ERC20_BALANCE_ABI,
        functionName: 'balanceOf',
        args: [LIQUIDITY_POOLS.OP_DUAL_POOL.lpAddress],
        chainId: LIQUIDITY_POOLS.OP_DUAL_POOL.chainId
      }
    ]
  });

  const totalLiquidity = poolBalances?.reduce((acc, balance, index) => {
    if (!balance?.result) return acc;

    const value = Number(formatEther(balance.result));
    // Multiply by 2 as per the requirement
    if (index === 2 || index === 5) {
      // ION pools
      return acc + value * ionPrice * 2;
    }
    return acc + value * ethPrice * 2;
  }, 0);

  return totalLiquidity || 0;
}

// Define result types to help TypeScript
interface ReadContractResult {
  error?: Error;
  result?: bigint;
  status: 'failure' | 'success';
}

export function useStakedLiquidity({
  address,
  veIonContract
}: StakedLiquidityProps) {
  const { data: ethPrice = 0 } = useEthPrice();

  const { data: stakedValue } = useReadContracts({
    contracts: [
      {
        address: veIonContract,
        abi: veIonAbi,
        functionName: 'getTotalEthValueOfTokens',
        args: address ? [address] : undefined
      }
    ]
  }) as { data?: ReadContractResult[] };

  const stakedLiquidity =
    stakedValue?.[0]?.result && address
      ? Number(formatEther(stakedValue[0].result)) * ethPrice
      : 0;

  return stakedLiquidity || 0;
}

export function useLockedLiquidity(veIonContract: Address) {
  const { data: lockedSupplies } = useReadContracts({
    contracts: LP_TYPES.map((lpType) => ({
      address: veIonContract,
      abi: veIonAbi,
      functionName: 's_supply',
      args: [lpType]
    }))
  }) as { data?: ReadContractResult[] };

  const totalLocked = lockedSupplies?.reduce((acc, supply) => {
    if (!supply?.result) return acc;
    return acc + Number(formatEther(supply.result));
  }, 0);

  return totalLocked || 0;
}
