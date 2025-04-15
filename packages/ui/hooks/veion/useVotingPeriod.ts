import { useMemo, useState, useEffect, useCallback } from 'react';

import { usePublicClient, useReadContracts } from 'wagmi';

import { getiVoterContract } from '@ui/constants/veIon';

const EPOCH_START_TIMESTAMP = 1739404800;
const EPOCH_DURATION_DAYS = 7;
const EPOCH_DURATION_SECONDS = EPOCH_DURATION_DAYS * 24 * 60 * 60;
const VOTING_CUTOFF_HOURS = 12;
const VOTING_CUTOFF_SECONDS = VOTING_CUTOFF_HOURS * 60 * 60;

export const calculateCurrentEpoch = () => {
  const now = Math.floor(Date.now() / 1000);
  const timeDiff = now - EPOCH_START_TIMESTAMP;
  return Math.floor(timeDiff / EPOCH_DURATION_SECONDS);
};

const calculateVotingPeriodEndDate = (epoch = calculateCurrentEpoch()) => {
  const epochEndTimestamp =
    EPOCH_START_TIMESTAMP + (epoch + 1) * EPOCH_DURATION_SECONDS;
  return new Date((epochEndTimestamp - VOTING_CUTOFF_SECONDS) * 1000);
};

const getNextVotingPeriod = () => {
  const currentEpoch = calculateCurrentEpoch();
  const nextEpochStartTimestamp =
    EPOCH_START_TIMESTAMP + (currentEpoch + 1) * EPOCH_DURATION_SECONDS;
  return new Date(nextEpochStartTimestamp * 1000);
};

const calculateTimeRemaining = (targetDate: Date, now: Date) => {
  const difference = targetDate.getTime() - now.getTime();
  return {
    days: Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24))),
    hours: Math.max(
      0,
      Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    ),
    minutes: Math.max(
      0,
      Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    ),
    seconds: Math.max(0, Math.floor((difference % (1000 * 60)) / 1000))
  };
};

export function useVotingPeriod(
  chain: string,
  tokenId?: number
): VotingPeriodInfo {
  const publicClient = usePublicClient({ chainId: +chain });
  const [lastVoted, setLastVoted] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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
    const votingPeriodEndDate = calculateVotingPeriodEndDate(currentEpoch);
    const nextVotingDate = getNextVotingPeriod();
    const hasVoted = lastVoted ? hasVotedInCurrentEpoch(lastVoted) : false;

    const isVotingClosed = now >= votingPeriodEndDate;

    // Calculate time remaining to either voting end or next voting period
    const timeRemaining = isVotingClosed
      ? calculateTimeRemaining(nextVotingDate, now)
      : calculateTimeRemaining(votingPeriodEndDate, now);

    return {
      hasVoted,
      nextVotingDate,
      currentEpoch,
      lastVoted,
      isLoading,
      error,
      timeRemaining,
      isVotingClosed,
      refetch: fetchLastVoted
    };
  }, [lastVoted, isLoading, error, fetchLastVoted, now]);
}

const hasVotedInCurrentEpoch = (lastVotedTimestamp: number) => {
  const currentEpoch = calculateCurrentEpoch();
  const epochStartTime =
    EPOCH_START_TIMESTAMP + currentEpoch * EPOCH_DURATION_SECONDS;
  const epochEndTime =
    EPOCH_START_TIMESTAMP +
    (currentEpoch + 1) * EPOCH_DURATION_SECONDS -
    VOTING_CUTOFF_SECONDS;
  return (
    lastVotedTimestamp >= epochStartTime && lastVotedTimestamp < epochEndTime
  );
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
  isVotingClosed: boolean;
  refetch: () => Promise<void>;
}

export function useVotingStatuses(chain: string, tokenIds: string[]) {
  const voterContract = getiVoterContract(+chain);

  const { data: lastVotedResults, isLoading: isLoadingVotes } =
    useReadContracts({
      contracts: tokenIds.map((tokenId) => ({
        ...voterContract,
        functionName: 'lastVoted',
        args: [BigInt(tokenId)]
      }))
    });

  const votingStatuses = useMemo(() => {
    if (!lastVotedResults) return {};

    return tokenIds.reduce<Record<string, boolean>>((acc, tokenId, index) => {
      const result = lastVotedResults[index];
      if (result?.status === 'success') {
        const lastVoted = Number(result.result);
        acc[tokenId] = hasVotedInCurrentEpoch(lastVoted);
      } else {
        acc[tokenId] = false;
      }
      return acc;
    }, {});
  }, [lastVotedResults, tokenIds]);

  return {
    votingStatuses,
    isLoading: isLoadingVotes
  };
}
