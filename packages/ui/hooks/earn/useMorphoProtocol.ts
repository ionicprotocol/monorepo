import { useCallback } from 'react';

import { AccrualPosition, Market } from '@morpho-org/blue-sdk';
import '@morpho-org/blue-sdk-viem/lib/augment/Market';
import '@morpho-org/blue-sdk-viem/lib/augment/MarketConfig';
import '@morpho-org/blue-sdk-viem/lib/augment/Position';
import { Time } from '@morpho-org/morpho-ts';
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

import type { MarketId } from '@morpho-org/blue-sdk';
import type { BigNumber } from 'ethers';

// Market ID for WETH/USDC on Base
const WETH_MARKET_ID =
  '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc' as MarketId;
const USDC_MARKET_ID =
  '0xa5cb8d928e666a5b632a5ba8c3b703b48fb19355ddbced1d7421bea50f498b99' as MarketId;

export const useMorphoProtocol = () => {
  const { address, currentChain, walletClient } = useMultiIonic();

  const getClient = useCallback(() => {
    if (!currentChain) throw new Error('Chain not connected');

    return createPublicClient({
      chain: currentChain,
      transport: http(currentChain.rpcUrls.default.http[0])
    });
  }, [currentChain]);

  // Fetch markets data
  const { data: marketsData, isLoading: isMarketsLoading } = useQuery({
    queryKey: ['morphoMarkets', currentChain?.id],
    queryFn: async () => {
      const client = getClient();
      const ethMarket = await Market.fetch(WETH_MARKET_ID, client);
      const usdcMarket = await Market.fetch(USDC_MARKET_ID, client);

      return {
        WETH: ethMarket,
        USDC: usdcMarket
      };
    },
    enabled: !!currentChain?.id,
    staleTime: 30000,
    retry: 2
  });

  // Fetch user positions
  const { data: userPositions, isLoading: isPositionsLoading } = useQuery({
    queryKey: ['morphoPositions', address, currentChain?.id],
    queryFn: async () => {
      if (!address) return null;
      const client = getClient();

      const ethPosition = await AccrualPosition.fetch(
        address,
        WETH_MARKET_ID,
        client
      );
      const usdcPosition = await AccrualPosition.fetch(
        address,
        USDC_MARKET_ID,
        client
      );

      return {
        WETH: ethPosition,
        USDC: usdcPosition
      };
    },
    enabled: !!address && !!currentChain?.id,
    staleTime: 30000,
    retry: 2
  });

  const supply = useCallback(
    async (asset: 'USDC' | 'WETH', amount: BigNumber) => {
      if (!address || !walletClient) {
        throw new Error('Wallet not connected');
      }

      try {
        console.log('Starting supply process:', {
          asset,
          amount: amount.toString(),
          address
        });

        const client = getClient();
        const marketId = asset === 'WETH' ? WETH_MARKET_ID : USDC_MARKET_ID;

        // Get market and update with current timestamp
        const market = await Market.fetch(marketId, client);
        const accruedMarket = market.accrueInterest(Time.timestamp());

        // Convert amount to shares
        const shares = accruedMarket.toSupplyShares(amount.toBigInt());

        console.log('Supply shares calculated:', shares.toString());

        // TODO: Implement actual supply transaction using walletClient
        // This will depend on the specific contract calls needed
      } catch (error) {
        console.error('Supply error:', error);
        throw error;
      }
    },
    [address, walletClient, getClient]
  );

  return {
    supply,
    marketsData,
    userPositions,
    isLoading: isMarketsLoading || isPositionsLoading,
    isConnected: !!address && !!walletClient
  };
};
