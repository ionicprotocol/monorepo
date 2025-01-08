import { useState } from 'react';
import { Card } from '@ui/components/ui/card';
import { useEmissionsContext } from '@ui/context/EmissionsManagementContext';
import VoteConfirmationDialog from './VoteConfirmationDialog';
import { MarketSide } from '@ui/hooks/veion/useVeIONVote';

interface EmissionsManagementFooterProps {
  onSubmitVotes?: () => Promise<void>;
  isVoting?: boolean;
}

function EmissionsManagementFooter({
  onSubmitVotes,
  isVoting = false
}: EmissionsManagementFooterProps) {
  const { votes, resetVotes, marketRows } = useEmissionsContext();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const hasVotes = Object.keys(votes).length > 0;

  // Transform votes into the format needed for the confirmation dialog
  const voteData = marketRows.reduce(
    (acc, row) => {
      if (row.voteValue) {
        const key = `${row.marketAddress}-${row.side === MarketSide.Supply ? 'supply' : 'borrow'}`;
        acc[key] = {
          marketAddress: row.marketAddress,
          side: row.side,
          voteValue: row.voteValue,
          asset: row.asset
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
      }
    >
  );

  const handleFullReset = () => {
    resetVotes();
  };

  const handleVoteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmVote = async () => {
    if (onSubmitVotes) {
      await onSubmitVotes();
    }
    setShowConfirmation(false);
  };

  return (
    <>
      <Card className="fixed bottom-4 left-4 right-4 p-4 bg-[#35363D] border-t border-white/10 z-10">
        <div className="flex justify-end w-full">
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
              disabled={!hasVotes || isVoting}
              className={`
                px-4 py-2 text-sm 
                ${
                  hasVotes && !isVoting
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-green-500/50 cursor-not-allowed'
                }
                text-white rounded-lg transition-colors
              `}
            >
              {isVoting ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span>
                  Voting...
                </div>
              ) : (
                'Vote'
              )}
            </button>
          </div>
        </div>
      </Card>

      <VoteConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmVote}
        votes={voteData}
        isVoting={isVoting || false}
      />
    </>
  );
}

export default EmissionsManagementFooter;
