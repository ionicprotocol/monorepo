import { useCallback } from 'react';

import { createPublicClient, erc20Abi, http } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { morphoBaseAddresses, vaultAbi } from '@ui/utils/morphoUtils';

import type { BigNumber } from 'ethers';

export const useMorphoProtocol = () => {
  const { address, currentChain, walletClient } = useMultiIonic();

  const getClient = useCallback(() => {
    if (!currentChain) throw new Error('Chain not connected');
    return createPublicClient({
      chain: currentChain,
      transport: http(currentChain.rpcUrls.default.http[0])
    });
  }, [currentChain]);

  const supply = useCallback(
    async (asset: 'USDC' | 'WETH', amount: BigNumber) => {
      if (!address || !walletClient) {
        throw new Error('Wallet not connected');
      }

      try {
        const client = getClient();
        const vaultAddress = morphoBaseAddresses.vaults[asset];
        const tokenAddress = morphoBaseAddresses.tokens[asset];

        const allowance = await client.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address, vaultAddress]
        });

        const amountBigInt = amount.toBigInt();

        if (allowance < amountBigInt) {
          const approvalTx = await walletClient.writeContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            args: [vaultAddress, amountBigInt],
            chain: currentChain,
            account: address
          });

          await client.waitForTransactionReceipt({ hash: approvalTx });
        }

        const depositTx = await walletClient.writeContract({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: 'deposit',
          args: [amountBigInt, address],
          chain: currentChain,
          account: address
        });

        const receipt = await client.waitForTransactionReceipt({
          hash: depositTx
        });
        return receipt;
      } catch (error) {
        throw error;
      }
    },
    [address, walletClient, getClient, currentChain]
  );

  const getMaxWithdraw = useCallback(
    async (asset: 'USDC' | 'WETH') => {
      if (!address) return BigInt(0);

      try {
        const client = getClient();
        const vaultAddress = morphoBaseAddresses.vaults[asset];

        const maxWithdraw = await client.readContract({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: 'maxWithdraw',
          args: [address]
        });

        return maxWithdraw;
      } catch (error) {
        console.error('Error getting max withdraw:', error);
        return BigInt(0);
      }
    },
    [address, getClient]
  );

  const withdraw = useCallback(
    async (asset: 'USDC' | 'WETH', amount: BigNumber) => {
      if (!address || !walletClient) {
        throw new Error('Wallet not connected');
      }

      try {
        const client = getClient();
        const vaultAddress = morphoBaseAddresses.vaults[asset];
        const amountBigInt = amount.toBigInt();

        const maxWithdraw = await getMaxWithdraw(asset);
        if (amountBigInt > maxWithdraw) {
          throw new Error('Withdrawal amount exceeds available balance');
        }

        const withdrawTx = await walletClient.writeContract({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: 'withdraw',
          args: [amountBigInt, address, address],
          chain: currentChain,
          account: address
        });

        const receipt = await client.waitForTransactionReceipt({
          hash: withdrawTx
        });
        return receipt;
      } catch (error) {
        throw error;
      }
    },
    [address, walletClient, getClient, currentChain, getMaxWithdraw]
  );

  return {
    supply,
    withdraw,
    getMaxWithdraw,
    isLoading: false,
    isConnected: !!address && !!walletClient
  };
};
