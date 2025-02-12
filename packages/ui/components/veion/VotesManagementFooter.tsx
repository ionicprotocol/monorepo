import { useState } from 'react';

import { InfoIcon } from 'lucide-react';

import { Card } from '@ui/components/ui/card';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIonVoteContext } from '@ui/context/VeIonVoteContext';
import { useVotes } from '@ui/context/VotesContext';
import { useVeIONVote } from '@ui/hooks/veion/useVeIONVote';
import { MarketSide } from '@ui/types/veION';

import VoteConfirmationDialog from './VoteConfirmationDialog';

interface VotesManagementFooterProps {
  tokenId: number;
}

function VotesManagementFooter({ tokenId }: VotesManagementFooterProps) {
  const { currentChain } = useVeIONContext();
  const { votes, resetVotes, totalVotes } = useVotes();
  const { allMarketRows, votingPeriod } = useVeIonVoteContext();
  const { isVoting } = useVeIONVote(currentChain);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (votingPeriod.isVotingClosed) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 p-4 bg-[#35363D] border-t border-white/10 z-10">
        <div className="flex flex-col w-full">
          <div className="border border-yellow-200 text-yellow-200 text-xs flex items-center gap-3 rounded-md py-2.5 px-4">
            <InfoIcon className="h-5 w-5 flex-shrink-0" />
            <span>
              Voting period is currently closed. Next voting period will start
              at the beginning of the next epoch.
            </span>
          </div>
        </div>
      </Card>
    );
  }

  const hasVotes = Object.keys(votes).length > 0;
  const remainingVotes = 100 - totalVotes;
  const isVoteEnabled =
    hasVotes &&
    !isVoting &&
    !votingPeriod.hasVoted &&
    Math.abs(remainingVotes) < 0.01;

  const marketAssetMap = Object.values(allMarketRows).reduce(
    (acc, pool) => {
      pool.data.forEach((row) => {
        const key = `${row.marketAddress}-${row.side === MarketSide.Supply ? 'supply' : 'borrow'}`;
        acc[key] = {
          asset: row.asset,
          marketAddress: row.marketAddress as `0x${string}`,
          side: row.side,
          poolName: pool.poolName
        };
      });
      return acc;
    },
    {} as Record<
      string,
      {
        asset: string;
        marketAddress: `0x${string}`;
        side: MarketSide;
        poolName: string;
      }
    >
  );

  const voteData = Object.entries(votes).reduce(
    (acc, [key, voteValue]) => {
      const marketInfo = marketAssetMap[key];
      if (marketInfo) {
        acc[key] = {
          marketAddress: marketInfo.marketAddress,
          side: marketInfo.side,
          voteValue: voteValue,
          asset: marketInfo.asset,
          poolName: marketInfo.poolName
        };
      }
      return acc;
    },
    {} as Record<
      string,
      {
        marketAddress: `0x${string}`;
        side: MarketSide;
        voteValue: string;
        asset: string;
        poolName: string;
      }
    >
  );

  const handleFullReset = () => {
    resetVotes();
    setSubmitError(null);
  };

  const handleVoteClick = () => {
    setSubmitError(null);
    if (Math.abs(remainingVotes) > 0.01) {
      setSubmitError('Total votes must equal exactly 100%');
    } else {
      setShowConfirmation(true);
    }
  };

  const getButtonStyles = () => {
    if (isVoting) return 'bg-gray-500 cursor-not-allowed';
    if (isVoteEnabled) return 'bg-green-500 hover:bg-green-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  const getButtonText = () => {
    if (isVoting) {
      return (
        <div className="flex items-center gap-2">
          <span className="animate-spin">⟳</span>
          Voting...
        </div>
      );
    }
    if (Math.abs(remainingVotes) < 0.01)
      return `Vote (${totalVotes.toFixed(2)}%)`;
    return `Remaining (${remainingVotes.toFixed(2)}%)`;
  };

  return (
    <>
      <Card className="fixed bottom-4 left-4 right-4 p-4 bg-[#35363D] border-t border-white/10 z-10">
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center w-full">
            <div className="space-y-2">
              {submitError && (
                <div className="text-sm text-red-500">{submitError}</div>
              )}
              <div className="border border-yellow-200 text-yellow-200 text-xs flex items-center gap-3 rounded-md py-2.5 px-4">
                <InfoIcon className="h-5 w-5 flex-shrink-0" />
                <span>
                  You can vote once per epoch and votes are final. Your voting
                  power (100%) must be fully allocated across your chosen
                  positions.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleFullReset}
                className="px-4 py-2 text-sm text-white/60 hover:text-white/80 transition-colors border border-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!hasVotes || isVoting}
              >
                Reset
              </button>

              <button
                onClick={handleVoteClick}
                disabled={!hasVotes || isVoting || votingPeriod.hasVoted}
                className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${getButtonStyles()}`}
              >
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <VoteConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setSubmitError(null);
        }}
        votes={voteData}
        tokenId={tokenId}
      />
    </>
  );
}

export default VotesManagementFooter;
