import { useCallback, useEffect, useState } from 'react';

import { createPublicClient, erc20Abi, http } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { morphoBaseAddresses, vaultAbi } from '@ui/utils/morphoUtils';

interface MorphoProtocolProps {
  asset: 'USDC' | 'WETH';
  isLegacy?: boolean;
}

export const useMorphoProtocol = ({ asset, isLegacy }: MorphoProtocolProps) => {
  const { address, currentChain, walletClient } = useMultiIonic();
  const [maxWithdraw, setMaxWithdraw] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);

  const getClient = useCallback(() => {
    if (!currentChain) throw new Error('Chain not connected');
    return createPublicClient({
      chain: currentChain,
      transport: http(currentChain.rpcUrls.default.http[0])
    });
  }, [currentChain]);

  const fetchMaxWithdraw = useCallback(async () => {
    if (!address) {
      setMaxWithdraw(BigInt(0));
      return;
    }

    try {
      setIsLoading(true);
      const client = getClient();
      const vaultAddress = isLegacy
        ? morphoBaseAddresses.legacyVaults[asset]
        : morphoBaseAddresses.vaults[asset];

      const max = await client.readContract({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: 'maxWithdraw',
        args: [address]
      });

      setMaxWithdraw(max);
    } catch (error) {
      console.error('Error getting max withdraw:', error);
      setMaxWithdraw(BigInt(0));
    } finally {
      setIsLoading(false);
    }
  }, [address, asset, getClient, isLegacy]);

  useEffect(() => {
    if (asset) fetchMaxWithdraw();
  }, [address, asset, fetchMaxWithdraw]);

  const supply = useCallback(
    async (amount: bigint) => {
      if (!address || !walletClient) {
        throw new Error('Wallet not connected');
      }

      try {
        const client = getClient();
        const vaultAddress = isLegacy
          ? morphoBaseAddresses.legacyVaults[asset]
          : morphoBaseAddresses.vaults[asset];
        const tokenAddress = morphoBaseAddresses.tokens[asset];

        const allowance = await client.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address, vaultAddress]
        });

        if (allowance < amount) {
          const approvalTx = await walletClient.writeContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            args: [vaultAddress, amount],
            chain: currentChain,
            account: address
          });

          await client.waitForTransactionReceipt({ hash: approvalTx });
        }

        const depositTx = await walletClient.writeContract({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: 'deposit',
          args: [amount, address],
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
    [address, walletClient, getClient, isLegacy, asset, currentChain]
  );

  const withdraw = useCallback(
    async (amount: bigint) => {
      if (!address || !walletClient) {
        throw new Error('Wallet not connected');
      }

      try {
        const client = getClient();
        const vaultAddress = isLegacy
          ? morphoBaseAddresses.legacyVaults[asset]
          : morphoBaseAddresses.vaults[asset];

        if (amount > maxWithdraw) {
          throw new Error('Withdrawal amount exceeds available balance');
        }

        const withdrawTx = await walletClient.writeContract({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: 'withdraw',
          args: [amount, address, address],
          chain: currentChain,
          account: address
        });

        const receipt = await client.waitForTransactionReceipt({
          hash: withdrawTx
        });
        fetchMaxWithdraw();

        return receipt;
      } catch (error) {
        throw error;
      }
    },
    [
      address,
      walletClient,
      getClient,
      isLegacy,
      asset,
      maxWithdraw,
      currentChain,
      fetchMaxWithdraw
    ]
  );

  return {
    supply,
    withdraw,
    maxWithdraw,
    isLoading,
    isConnected: !!address && !!walletClient
  };
};
