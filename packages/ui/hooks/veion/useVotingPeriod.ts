import { useMemo, useState, useEffect, useCallback } from 'react';

import { usePublicClient } from 'wagmi';

import { getiVoterContract } from '@ui/constants/veIon';

const EPOCH_START_TIMESTAMP = 1739404800;
const EPOCH_DURATION_DAYS = 7;
const EPOCH_DURATION_SECONDS = EPOCH_DURATION_DAYS * 24 * 60 * 60;

const calculateCurrentEpoch = () => {
  const now = Math.floor(Date.now() / 1000);
  const timeDiff = now - EPOCH_START_TIMESTAMP;
  return Math.floor(timeDiff / EPOCH_DURATION_SECONDS);
};

const calculateVotingPeriodEndDate = (epoch = calculateCurrentEpoch()) => {
  const epochEndTimestamp =
    EPOCH_START_TIMESTAMP + (epoch + 1) * EPOCH_DURATION_SECONDS;
  return new Date(epochEndTimestamp * 1000);
};

const hasVotedInCurrentEpoch = (lastVotedTimestamp: number | null) => {
  if (!lastVotedTimestamp) return false;

  const currentEpoch = calculateCurrentEpoch();
  const epochStartTime =
    EPOCH_START_TIMESTAMP + currentEpoch * EPOCH_DURATION_SECONDS;
  const epochEndTime = epochStartTime + EPOCH_DURATION_SECONDS;

  return (
    lastVotedTimestamp >= epochStartTime && lastVotedTimestamp < epochEndTime
  );
};

const getNextVotingPeriod = () => {
  const currentEpoch = calculateCurrentEpoch();
  const nextEpochStartTimestamp =
    EPOCH_START_TIMESTAMP + (currentEpoch + 1) * EPOCH_DURATION_SECONDS;
  return new Date(nextEpochStartTimestamp * 1000);
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
  const publicClient = usePublicClient({
    chainId: +chain
  });
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
    const nextVotingDate = lastVoted ? getNextVotingPeriod() : null;

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
