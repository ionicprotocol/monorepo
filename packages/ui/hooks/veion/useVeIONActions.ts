import { erc20Abi, parseEther, parseUnits } from 'viem';
import { useAccount } from 'wagmi';

import { LiquidityContractAbi } from '@ui/constants/lp';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useVeION } from '@ui/context/VeIonContext';
import {
  getPoolToken,
  getSpenderContract,
  getToken
} from '@ui/utils/getStakingTokens';

import { useContractWrite } from '../useContractWrite';

interface AddLiquidityParams {
  tokenAmount: string;
  tokenBAmount: string;
  selectedToken: 'eth' | 'mode' | 'weth';
  slippage?: number;
}

interface RemoveLiquidityParams {
  liquidity: string;
  selectedToken: 'eth' | 'mode' | 'weth';
}

interface LockVeIONParams {
  tokenAddress: `0x${string}`;
  tokenAmount: string;
  duration: number;
  stakeUnderlying?: boolean;
}

export function useVeIONActions() {
  const { getSdk } = useMultiIonic();
  const { address, isConnected } = useAccount();
  const { write, isPending } = useContractWrite();
  const { currentChain, prices } = useVeION();

  // Get veION contract
  const ionicSdk = getSdk(currentChain);
  const veIonContract = ionicSdk?.veIONContracts?.veION;

  const addLiquidity = async ({
    tokenAmount,
    tokenBAmount,
    selectedToken,
    slippage = 5
  }: AddLiquidityParams) => {
    if (!address) throw new Error('Wallet not connected');

    const tokenA = getToken(currentChain);
    const tokenB = getPoolToken(selectedToken);
    const deadline = Math.floor((Date.now() + 3600000) / 1000);

    const minA =
      parseEther(tokenAmount) -
      (parseEther(tokenAmount) * BigInt(slippage)) / BigInt(100);
    const minB =
      parseEther(tokenBAmount) -
      (parseEther(tokenBAmount) * BigInt(slippage)) / BigInt(100);

    const functionName =
      selectedToken === 'eth' ? 'addLiquidityETH' : 'addLiquidity';
    const args =
      selectedToken === 'eth'
        ? [
            tokenA,
            false,
            parseUnits(tokenAmount, 18),
            minA,
            minB,
            address,
            deadline
          ]
        : [
            tokenA,
            tokenB,
            false,
            parseUnits(tokenAmount, 18),
            parseUnits(tokenBAmount, 18),
            minA,
            minB,
            address,
            deadline
          ];

    return write(
      {
        address: getSpenderContract(currentChain),
        abi: LiquidityContractAbi,
        functionName,
        args,
        value:
          selectedToken === 'eth' ? parseUnits(tokenBAmount, 18) : undefined
      },
      {
        successMessage: 'Successfully added liquidity'
      }
    );
  };

  const removeLiquidity = async ({
    liquidity,
    selectedToken
  }: RemoveLiquidityParams) => {
    if (!isConnected) throw new Error('Wallet not connected');

    const args = {
      token: getToken(currentChain),
      tokenB: getPoolToken(selectedToken),
      stable: false,
      liquidity: parseUnits(liquidity, 18),
      amounTokenMin: 0n,
      amountETHMin: 0n,
      to: address,
      deadline: Math.floor((Date.now() + 3600000) / 1000)
    };

    const stakingTokenAddress = getToken(currentChain);
    const spenderContract = getSpenderContract(currentChain);

    // Handle approvals and removal
    await write(
      {
        address: stakingTokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spenderContract, args.liquidity]
      },
      {
        successMessage: 'Approval successful'
      }
    );

    return write(
      {
        address: spenderContract,
        abi: LiquidityContractAbi,
        functionName:
          selectedToken === 'eth' ? 'removeLiquidityETH' : 'removeLiquidity',
        args:
          selectedToken === 'eth'
            ? [
                args.token,
                args.stable,
                args.liquidity,
                args.amounTokenMin,
                args.amountETHMin,
                args.to,
                args.deadline
              ]
            : [
                args.token,
                args.tokenB,
                args.stable,
                args.liquidity,
                args.amounTokenMin,
                args.amountETHMin,
                args.to,
                args.deadline
              ]
      },
      {
        successMessage: 'Successfully removed liquidity'
      }
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
      },
      {
        successMessage: 'Successfully created veION lock'
      }
    );
  };

  return {
    addLiquidity,
    removeLiquidity,
    createLock,
    isPending,
    isContractLoading: !veIonContract,
    prices
  };
}
