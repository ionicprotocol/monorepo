import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePublicClient } from 'wagmi';

import { getVoterContract } from '@ui/constants/veIon';
import { MarketSide } from '@ui/types/veION';

import type { Address } from 'viem';

import { bribeRewardsAbi } from '@ionicprotocol/sdk/src/generated';

interface UseVeAPRParams {
  chain: number;
  marketAddresses: `0x${string}`[];
  marketSides: MarketSide[];
}

export function useVeAPR({
  chain,
  marketAddresses,
  marketSides
}: UseVeAPRParams) {
  const publicClient = usePublicClient();
  const [veAPRs, setVeAPRs] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const voterContract = useMemo(() => getVoterContract(chain), [chain]);

  const calculateVeAPR = useCallback(async () => {
    // Initialize veAPRs with all markets set to 0
    const initialVeAPRs: Record<string, number> = {};
    marketAddresses.forEach((market, index) => {
      const side = marketSides[index];
      const key = `${market}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;
      initialVeAPRs[key] = 0;
    });

    // Only proceed if we have all required data
    if (!voterContract || !publicClient || !marketAddresses.length) {
      setVeAPRs(initialVeAPRs);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const newVeAPRs = { ...initialVeAPRs };

      // Process each market
      await Promise.all(
        marketAddresses.map(async (market, index) => {
          const side = marketSides[index];
          const key = `${market}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;

          try {
            // Get reward accumulator address for market and side
            const rewardAccumulator = (await publicClient.readContract({
              ...voterContract,
              functionName: 'marketToRewardAccumulators',
              args: [market, side]
            })) as Address;

            if (!rewardAccumulator) {
              // console.log('No reward accumulator for market:', key);
              return;
            }

            // Get bribe contract address
            const bribeAddress = (await publicClient.readContract({
              ...voterContract,
              functionName: 'rewardAccumulatorToBribe',
              args: [rewardAccumulator]
            })) as Address;

            if (
              !bribeAddress ||
              bribeAddress === '0x0000000000000000000000000000000000000000'
            ) {
              // console.log('No bribe contract for market:', key);
              return;
            }

            // Create bribe contract instance
            const bribeContract = {
              address: bribeAddress,
              abi: bribeRewardsAbi
            };

            // Get reward tokens
            const rewardTokens = (await publicClient.readContract({
              ...bribeContract,
              functionName: 'getAllLpRewardTokens'
            })) as Address[];
            // console.log('Reward tokens:', rewardTokens);

            if (!rewardTokens.length) {
              //   console.log('No reward tokens for market:', key);
              return;
            }

            const currentEpoch = Math.floor(
              Date.now() / 1000 / (7 * 24 * 60 * 60)
            );

            // Get total rewards per epoch for each token
            const rewardAmounts = await Promise.all(
              rewardTokens.map(async (token) => {
                const amount = (await publicClient.readContract({
                  ...bribeContract,
                  functionName: 'tokenRewardsPerEpoch',
                  args: [token, BigInt(currentEpoch)]
                })) as bigint;
                return amount;
              })
            );
            // console.log('Reward amounts:', { key, rewardAmounts });

            // Get total voting power for first token
            const totalSupply = (await publicClient.readContract({
              ...bribeContract,
              functionName: 'totalSupply',
              args: [rewardTokens[0]]
            })) as bigint;
            // console.log('Total supply:', { key, totalSupply });

            // Calculate APR
            const totalWeeklyBribes = rewardAmounts.reduce(
              (sum: bigint, amount: bigint) => sum + amount,
              0n
            );
            const yearlyBribes = totalWeeklyBribes * 52n;

            const veAPR =
              totalSupply > 0n
                ? Number((yearlyBribes * 100n) / totalSupply)
                : 0;

            // console.log('Calculated veAPR:', { key, veAPR });
            newVeAPRs[key] = veAPR;
          } catch (err) {
            console.error('Error processing market:', { key, error: err });
            // Keep the initial 0 value for this market
          }
        })
      );

      //   console.log('Setting new veAPRs:', newVeAPRs);
      setVeAPRs(newVeAPRs);
      setError(null);
    } catch (err) {
      console.error('Error calculating veAPR:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to calculate veAPR')
      );
      setVeAPRs(initialVeAPRs); // Set initial values on error
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, marketAddresses, marketSides, publicClient, voterContract]);

  // Only run when marketAddresses changes
  useEffect(() => {
    if (marketAddresses.length > 0) {
      calculateVeAPR();
    }
  }, [marketAddresses, calculateVeAPR]);

  return { veAPRs, isLoading, error, refresh: calculateVeAPR };
}
