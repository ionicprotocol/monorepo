import { formatUnits, parseEther, parseUnits } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { LiquidityContractAbi } from '@ui/constants/lp';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import {
  getPoolToken,
  getReservesABI,
  getReservesArgs,
  getReservesContract,
  getSpenderContract,
  getToken
} from '@ui/utils/getStakingTokens';

import { useContractWrite } from '../useContractWrite';
import { useTokenPrice, useIonPrice } from '../useDexScreenerPrices';

interface AddLiquidityParams {
  tokenAmount: string;
  tokenBAmount: string;
  selectedToken: 'eth' | 'mode' | 'weth';
  slippage?: number;
}

interface RemoveLiquidityParams {
  liquidity: string;
  selectedToken: 'eth' | 'mode' | 'weth';
  slippage?: number;
}

interface LockVeIONParams {
  tokenAddress: `0x${string}`;
  tokenAmount: string;
  duration: number;
  stakeUnderlying?: boolean;
}

// Extend WriteContractOptions to include value
interface ExtendedWriteContractOptions {
  successMessage?: string;
  errorMessage?: string;
  value?: bigint;
}

export function useVeION(chain: number) {
  const { getSdk } = useMultiIonic();
  const ionicSdk = getSdk(chain);
  const { address } = useAccount();
  const { write, isPending } = useContractWrite();

  // Get veION contract
  const veIonContract = ionicSdk?.veIONContracts?.veION;

  // Use the external price hooks
  const { data: tokenPriceData } = useTokenPrice(chain);
  const { data: ionPriceData } = useIonPrice({ chainId: chain });

  // Get reserves for swap rate calculation
  const reserves = useReadContract({
    abi: getReservesABI(chain),
    address: getReservesContract(chain),
    args: getReservesArgs(chain, 'eth'),
    functionName: 'getReserves',
    chainId: chain,
    query: {
      enabled: true,
      placeholderData: [0n, 0n]
    }
  });

  const calculateMinimumOutputs = (
    amountA: string,
    amountB: string,
    slippage: number = 5
  ) => {
    const minA =
      parseEther(amountA) -
      (parseEther(amountA) * BigInt(slippage)) / BigInt(100);
    const minB =
      parseEther(amountB) -
      (parseEther(amountB) * BigInt(slippage)) / BigInt(100);
    return { minA, minB };
  };

  const addLiquidity = async ({
    tokenAmount,
    tokenBAmount,
    selectedToken,
    slippage = 5
  }: AddLiquidityParams) => {
    if (!address) throw new Error('Wallet not connected');

    const tokenA = getToken(chain);
    const tokenB = getPoolToken(selectedToken);
    const { minA, minB } = calculateMinimumOutputs(
      tokenAmount,
      tokenBAmount,
      slippage
    );
    const deadline = Math.floor((Date.now() + 3600000) / 1000);

    const functionName =
      selectedToken === 'eth' ? 'addLiquidityETH' : 'addLiquidity';
    const args =
      selectedToken === 'eth'
        ? [
            tokenA,
            false, // stable
            parseUnits(tokenAmount, 18),
            minA,
            minB,
            address,
            deadline
          ]
        : [
            tokenA,
            tokenB,
            false, // stable
            parseUnits(tokenAmount, 18),
            parseUnits(tokenBAmount, 18),
            minA,
            minB,
            address,
            deadline
          ];

    return write(
      {
        address: getSpenderContract(chain),
        abi: LiquidityContractAbi,
        functionName,
        args
      } as const,
      {
        successMessage: 'Successfully added liquidity',
        value:
          selectedToken === 'eth' ? parseUnits(tokenBAmount, 18) : undefined
      } as ExtendedWriteContractOptions
    );
  };

  const removeLiquidity = async ({
    liquidity,
    selectedToken,
    slippage = 5
  }: RemoveLiquidityParams) => {
    if (!address) throw new Error('Wallet not connected');

    const tokenA = getToken(chain);
    const tokenB = getPoolToken(selectedToken);
    const deadline = Math.floor((Date.now() + 3600000) / 1000);

    const functionName =
      selectedToken === 'eth' ? 'removeLiquidityETH' : 'removeLiquidity';
    const args =
      selectedToken === 'eth'
        ? [
            tokenA,
            false, // stable
            parseUnits(liquidity, 18),
            0n, // amountAMin
            0n, // amountBMin
            address,
            deadline
          ]
        : [
            tokenA,
            tokenB,
            false, // stable
            parseUnits(liquidity, 18),
            0n, // amountAMin
            0n, // amountBMin
            address,
            deadline
          ];

    return write(
      {
        address: getSpenderContract(chain),
        abi: LiquidityContractAbi,
        functionName,
        args
      } as const,
      { successMessage: 'Successfully removed liquidity' }
    );
  };

  const createLock = async ({
    tokenAddress,
    tokenAmount,
    duration,
    stakeUnderlying = true
  }: LockVeIONParams) => {
    if (!veIonContract) throw new Error('Contract not initialized');

    return write(
      {
        address: veIonContract.address,
        abi: veIonContract.abi,
        functionName: 'createLock',
        args: [
          tokenAddress,
          parseUnits(tokenAmount, 18),
          duration,
          stakeUnderlying
        ]
      } as const,
      { successMessage: 'Successfully created veION lock' }
    );
  };

  const getAmountOut = async (amountIn: string, tokenIn: `0x${string}`) => {
    if (!reserves.data) return '0';

    const reservesData = reserves.data as readonly [bigint, bigint];
    const [reserve0, reserve1] = reservesData;

    // swap rate calc
    const amountInWithFee = parseUnits(amountIn, 18) * 997n;
    const numerator = amountInWithFee * reserve1;
    const denominator = reserve0 * 1000n + amountInWithFee;
    return formatUnits(numerator / denominator, 18);
  };

  return {
    addLiquidity,
    removeLiquidity,
    createLock,
    getAmountOut,
    isPending,
    isContractLoading: !veIonContract,
    prices: {
      token: tokenPriceData?.pair.priceUsd,
      tokenSymbol: tokenPriceData?.tokenSymbol,
      ion: ionPriceData?.pair.priceUsd
    }
  };
}
