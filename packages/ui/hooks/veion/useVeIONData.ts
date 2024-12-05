// hooks/useLiquidity.ts
import { formatEther } from 'viem';
import { useReadContracts } from 'wagmi';

import {
  LIQUIDITY_POOLS,
  ERC20_BALANCE_ABI,
  LP_TYPES
} from '../../utils/getLiquidityTokens';
import { useIonPrices } from '../useDexScreenerPrices';
import { useEthPrice } from '../useEthPrice';

import type { Address } from 'viem';

import { emissionsManagerAbi, veIonAbi } from '@ionicprotocol/sdk';
export type LPType = (typeof LP_TYPES)[number];

interface VeIonDataProps {
  address?: Address;
  veIonContract: Address;
  emissionsManagerContract: Address;
}

interface ReadContractResult {
  error?: Error;
  result: bigint;
  status: 'failure' | 'success';
}

export function useVeIonData({
  address,
  veIonContract,
  emissionsManagerContract
}: VeIonDataProps) {
  const { data: ethPrice = 0 } = useEthPrice();
  const { data: ionPrices = {} } = useIonPrices();

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

  // Get locked tokens data
  const { data: mainData, isLoading: mainDataLoading } = useReadContracts({
    contracts: [
      {
        address: veIonContract,
        abi: veIonAbi,
        functionName: 'getTotalEthValueOfTokens',
        args: address ? [address] : undefined
      },
      {
        address: emissionsManagerContract,
        abi: emissionsManagerAbi,
        functionName: 'getUserTotalCollateral',
        args: address ? [address] : undefined
      }
    ]
  });

  const { data: lockedSupplies, isLoading: suppliesLoading } = useReadContracts(
    {
      contracts: LP_TYPES.map((lpType) => ({
        address: veIonContract,
        abi: veIonAbi,
        functionName: 's_supply',
        args: [lpType]
      }))
    }
  ) as { data?: ReadContractResult[]; isLoading: boolean };

  const [stakedValue, totalCollateral] = mainData || [];

  // Calculate total liquidity
  const totalLiquidity =
    poolBalances?.reduce((acc, balance, index) => {
      if (!balance?.result) return acc;
      const value = Number(formatEther(balance.result));

      // For ION pools get the correct chain's ION price
      if (index === 2) {
        // Mode ION Pool
        return acc + value * (ionPrices[34443] || 0) * 2;
      }
      if (index === 5) {
        // Optimism ION Pool
        return acc + value * (ionPrices[10] || 0) * 2;
      }

      // For ETH pools
      return acc + value * ethPrice * 2;
    }, 0) || 0;

  // Calculate staked/locked values
  const stakedAmount = stakedValue?.result
    ? Number(formatEther(stakedValue.result))
    : 0;
  const stakedLiquidity = stakedAmount * ethPrice;

  const totalCollateralAmount = totalCollateral?.result
    ? Number(formatEther(totalCollateral.result))
    : 0;

  // Calculate total locked
  const totalLocked =
    lockedSupplies?.reduce((acc, supply) => {
      if (!supply?.result) return acc;
      return acc + Number(formatEther(supply.result));
    }, 0) || 0;

  // Calculate percentage for emissions
  const emissionsPercentage =
    totalCollateralAmount > 0
      ? (stakedAmount / totalCollateralAmount) * 100
      : 0;

  return {
    liquidity: {
      total: totalLiquidity,
      staked: stakedLiquidity,
      locked: totalLocked,
      isLoading: mainDataLoading || suppliesLoading // Fixed loading state
    },
    emissions: {
      lockedValue: {
        amount: stakedAmount,
        usdValue: (stakedAmount * ethPrice).toFixed(2),
        percentage: emissionsPercentage
      },
      totalDeposits: {
        amount: totalCollateralAmount,
        usdValue: (totalCollateralAmount * ethPrice).toFixed(2)
      },
      isLoading: mainDataLoading || suppliesLoading // Fixed loading state
    }
  };
}
