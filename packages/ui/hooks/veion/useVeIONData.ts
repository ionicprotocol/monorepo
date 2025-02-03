import { formatEther } from 'viem';
import { useReadContracts } from 'wagmi';

import { VEION_CONTRACTS } from '@ui/constants/veIon';
import { VEION_CHAIN_CONFIGS } from '@ui/utils/veion/chainConfig';
import { useOracleBatch } from '../ionic/useOracleBatch';

import {
  LIQUIDITY_POOLS,
  ERC20_BALANCE_ABI
} from '../../utils/getLiquidityTokens';
import { useIonPrices } from '../useDexScreenerPrices';
import { useEthPrice } from '../useEthPrice';

import { iveIonAbi } from '@ionicprotocol/sdk';
import { getAvailableStakingToken } from '@ui/utils/getStakingTokens';

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

  // Get pool balances for total liquidity calculation
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
        // Optimism chain supplies
        ...VEION_CHAIN_CONFIGS[10].lpTypes.map((lpType) => ({
          address: VEION_CONTRACTS[10],
          abi: iveIonAbi,
          functionName: 's_supply',
          args: [BigInt(lpType)],
          chainId: 10
        }))
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
        lpTokenPrice =
          lpTokenPrices?.['0x0FAc819628a7F612AbAc1CaD939768058cc0170c'] || 0;
      } else if (chainId === 34443) {
        // Mode chain LP token
        lpTokenPrice =
          lpTokenPrices?.['0xC6A394952c097004F83d2dfB61715d245A38735a'] || 0;
      }

      const valueInUsd =
        amount * Number(formatEther(BigInt(lpTokenPrice || 0)));
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
    isLoading: supplyLoading,
    allChainSupplies
  };
}
