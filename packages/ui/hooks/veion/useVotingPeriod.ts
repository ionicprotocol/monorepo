import { useMemo, useState, useEffect, useCallback } from 'react';

import { usePublicClient } from 'wagmi';

import { getiVoterContract } from '@ui/constants/veIon';

export const EPOCH_ZERO = new Date('2025-01-27');
export const EPOCH_DURATION_DAYS = 8;
export const EPOCH_DURATION_SECONDS = EPOCH_DURATION_DAYS * 24 * 60 * 60;

export const calculateCurrentEpoch = () => {
  const now = new Date();
  const timeDiff = now.getTime() - EPOCH_ZERO.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  return Math.floor(daysDiff / EPOCH_DURATION_DAYS);
};

export const calculateVotingPeriodEndDate = (
  epoch = calculateCurrentEpoch()
) => {
  const epochStartDate = new Date(EPOCH_ZERO);
  epochStartDate.setDate(
    epochStartDate.getDate() + (epoch + 1) * EPOCH_DURATION_DAYS
  );
  return epochStartDate;
};

export const hasVotedInCurrentEpoch = (lastVotedTimestamp: number | null) => {
  if (!lastVotedTimestamp) return false;

  const currentEpoch = calculateCurrentEpoch();
  const epochStartTime =
    new Date(EPOCH_ZERO).getTime() / 1000 +
    currentEpoch * EPOCH_DURATION_SECONDS;
  const epochEndTime = epochStartTime + EPOCH_DURATION_SECONDS;
  return (
    lastVotedTimestamp >= epochStartTime && lastVotedTimestamp < epochEndTime
  );
};

export const getNextVotingPeriod = (lastVotedTimestamp: number) => {
  const currentEpoch = calculateCurrentEpoch();
  const nextEpochStart = new Date(EPOCH_ZERO);
  nextEpochStart.setDate(
    nextEpochStart.getDate() + (currentEpoch + 1) * EPOCH_DURATION_DAYS
  );
  return nextEpochStart;
};

export interface VotingPeriodInfo {
  hasVoted: boolean;
  nextVotingDate: Date | null;
  currentEpoch: number;
  lastVoted: number | null;
  isLoading: boolean;
  error: Error | null;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  refetch: () => Promise<void>;
}

export function useVotingPeriod(
  chain: string,
  tokenId?: number
): VotingPeriodInfo {
  const publicClient = usePublicClient();
  const [lastVoted, setLastVoted] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLastVoted = useCallback(async () => {
    if (!tokenId || !publicClient) {
      setLastVoted(null);
      return;
    }

    try {
      setIsLoading(true);
      const voterContract = getiVoterContract(+chain);
      const lastVotedTimestamp = await publicClient.readContract({
        ...voterContract,
        functionName: 'lastVoted',
        args: [BigInt(tokenId)]
      });

      setLastVoted(Number(lastVotedTimestamp));
      setError(null);
    } catch (err) {
      console.error('Error fetching last voted timestamp:', err);
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to fetch last voted timestamp')
      );
    } finally {
      setIsLoading(false);
    }
  }, [chain, tokenId, publicClient]);

  useEffect(() => {
    fetchLastVoted();
  }, [fetchLastVoted]);

  return useMemo(() => {
    const currentEpoch = calculateCurrentEpoch();
    const hasVoted = hasVotedInCurrentEpoch(lastVoted);
    const nextVotingDate = lastVoted ? getNextVotingPeriod(lastVoted) : null;

    const now = new Date();
    const votingPeriodEndDate = calculateVotingPeriodEndDate(currentEpoch);
    const difference = votingPeriodEndDate.getTime() - now.getTime();

    const timeRemaining = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      ),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };

    return {
      hasVoted,
      nextVotingDate,
      currentEpoch,
      lastVoted,
      isLoading,
      error,
      timeRemaining,
      refetch: fetchLastVoted
    };
  }, [lastVoted, isLoading, error, fetchLastVoted]);
}
