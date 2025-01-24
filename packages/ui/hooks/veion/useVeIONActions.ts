import { useState } from 'react';

import { erc20Abi, parseEther, parseUnits } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

import { LiquidityContractAbi } from '@ui/constants/lp';
import { getVeIonContract } from '@ui/constants/veIon';
import { useVeIONContext } from '@ui/context/VeIonContext';
import {
  getPoolToken,
  getSpenderContract,
  getToken
} from '@ui/utils/getStakingTokens';

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
  const { address, isConnected } = useAccount();
  const { currentChain, prices } = useVeIONContext();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Get veION contract
  const veIonContract = getVeIonContract(currentChain);
  const [isPending, setIsPending] = useState(false);

  const addLiquidity = async ({
    tokenAmount,
    tokenBAmount,
    selectedToken
  }: AddLiquidityParams) => {
    try {
      const args = {
        tokenA: getToken(currentChain),
        tokenB: getPoolToken(selectedToken),
        stable: false,
        amountTokenADesired: parseUnits(tokenAmount, 18),
        amounTokenAMin:
          parseEther(tokenAmount) -
          (parseEther(tokenAmount) * BigInt(5)) / BigInt(100),
        amountTokenBDesired: parseUnits(tokenBAmount, 18),
        amounTokenBMin:
          parseEther(tokenBAmount) -
          (parseEther(tokenBAmount) * BigInt(5)) / BigInt(100),
        to: address,
        deadline: Math.floor((Date.now() + 3600000) / 1000)
      };

      if (!isConnected || !walletClient) {
        console.error('Not connected');
        return;
      }

      const approvalA = await walletClient.writeContract({
        abi: erc20Abi,
        account: walletClient.account,
        address: args.tokenA,
        args: [getSpenderContract(currentChain), args.amountTokenADesired],
        functionName: 'approve'
      });

      if (selectedToken !== 'eth') {
        const approvalB = await walletClient.writeContract({
          abi: erc20Abi,
          account: walletClient.account,
          address: args.tokenB,
          args: [getSpenderContract(currentChain), args.amountTokenBDesired],
          functionName: 'approve'
        });
        await publicClient?.waitForTransactionReceipt({
          hash: approvalB
        });
      }

      setIsPending(true);
      await publicClient?.waitForTransactionReceipt({
        hash: approvalA
      });

      if (selectedToken === 'eth') {
        const tx = await walletClient.writeContract({
          abi: LiquidityContractAbi,
          account: walletClient.account,
          address: getSpenderContract(currentChain),
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
          value: parseUnits(tokenBAmount, 18)
        });

        const transaction = await publicClient?.waitForTransactionReceipt({
          hash: tx
        });
      } else {
        const tx = await walletClient.writeContract({
          abi: LiquidityContractAbi,
          account: walletClient.account,
          address: getSpenderContract(currentChain),
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
        });

        const transaction = await publicClient?.waitForTransactionReceipt({
          hash: tx
        });
      }

      setIsPending(false);
    } catch (err) {
      setIsPending(false);
    }
  };

  const removeLiquidity = async ({
    liquidity,
    selectedToken
  }: RemoveLiquidityParams) => {
    try {
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

      if (!isConnected || !walletClient) {
        console.error('Not connected');
        return;
      }

      const approval = await walletClient.writeContract({
        abi: erc20Abi,
        account: walletClient.account,
        address: args.token,
        args: [getSpenderContract(currentChain), args.liquidity],
        functionName: 'approve'
      });

      setIsPending(true);
      await publicClient?.waitForTransactionReceipt({
        hash: approval
      });

      if (selectedToken === 'eth') {
        const tx = await walletClient.writeContract({
          abi: LiquidityContractAbi,
          account: walletClient.account,
          address: getSpenderContract(currentChain),
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
        });

        await publicClient?.waitForTransactionReceipt({
          hash: tx
        });
      } else {
        const tx = await walletClient.writeContract({
          abi: LiquidityContractAbi,
          account: walletClient.account,
          address: getSpenderContract(currentChain),
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
        });

        await publicClient?.waitForTransactionReceipt({
          hash: tx
        });
      }

      setIsPending(false);
    } catch (err) {
      setIsPending(false);
    }
  };

  const createLock = async ({
    tokenAddress,
    tokenAmount,
    duration,
    stakeUnderlying = true
  }: LockVeIONParams) => {
    try {
      if (!veIonContract || !isConnected || !walletClient) {
        console.error('Contract not initialized or not connected');
        return;
      }

      setIsPending(true);

      // Convert duration from days to seconds
      const durationInSeconds = duration * 24 * 60 * 60;

      // approve
      const approvalTx = await walletClient.writeContract({
        abi: erc20Abi,
        account: walletClient.account,
        address: tokenAddress,
        args: [veIonContract.address, parseUnits(tokenAmount, 18)],
        functionName: 'approve'
      });

      // Wait for approval transaction to complete
      await publicClient?.waitForTransactionReceipt({
        hash: approvalTx
      });

      // lock
      const tx = await walletClient.writeContract({
        abi: veIonContract.abi,
        account: walletClient.account,
        address: veIonContract.address,
        args: [
          [tokenAddress],
          [parseUnits(tokenAmount, 18)],
          [BigInt(durationInSeconds)],
          [stakeUnderlying]
        ] as const,
        functionName: 'createLock'
      });

      const transaction = await publicClient?.waitForTransactionReceipt({
        hash: tx
      });

      setIsPending(false);
    } catch (err) {
      setIsPending(false);
    }
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
