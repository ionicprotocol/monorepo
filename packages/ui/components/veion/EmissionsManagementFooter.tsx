import { useState } from 'react';

import { Card } from '@ui/components/ui/card';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVotes, useTableData } from '@ui/context/VotesContext';
import { useVeIONVote } from '@ui/hooks/veion/useVeIONVote';
import { MarketSide } from '@ui/types/veION';

import VoteConfirmationDialog from './VoteConfirmationDialog';

interface EmissionsManagementFooterProps {
  tokenId: number;
}

function EmissionsManagementFooter({
  tokenId
}: EmissionsManagementFooterProps) {
  const { currentChain } = useVeIONContext();
  const { votes, resetVotes } = useVotes();
  const { marketRows } = useTableData();
  const { isVoting } = useVeIONVote(currentChain);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const hasVotes = Object.keys(votes).length > 0;

  // Calculate vote sum
  const voteSum = Object.values(votes).reduce((sum, value) => {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? sum : sum + numValue;
  }, 0);

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
    setSubmitError(null);
  };

  const handleVoteClick = () => {
    setSubmitError(null);
    if (voteSum <= 100) {
      setShowConfirmation(true);
    } else {
      setSubmitError('Total votes cannot exceed 100%');
    }
  };

  return (
    <>
      <Card className="fixed bottom-4 left-4 right-4 p-4 bg-[#35363D] border-t border-white/10 z-10">
        <div className="flex flex-col w-full">
          {submitError && (
            <div className="mb-4 text-sm text-red-500">{submitError}</div>
          )}
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
                  `Vote (${voteSum.toFixed(2)}%)`
                )}
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

export default EmissionsManagementFooter;
