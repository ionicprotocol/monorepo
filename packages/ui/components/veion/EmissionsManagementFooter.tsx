import { useState } from 'react';

import { Card } from '@ui/components/ui/card';
import { Checkbox } from '@ui/components/ui/checkbox';
import { useEmissionsContext } from '@ui/context/EmissionsManagementContext';

interface EmissionsManagementFooterProps {
  onSubmitVotes?: () => Promise<void>;
  isVoting?: boolean;
}

function EmissionsManagementFooter({
  onSubmitVotes,
  isVoting = false
}: EmissionsManagementFooterProps) {
  const { votes, resetVotes } = useEmissionsContext();
  const [autoRepeat, setAutoRepeat] = useState(false);
  const hasVotes = Object.keys(votes).length > 0;

  const handleFullReset = () => {
    resetVotes();
    setAutoRepeat(false);
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 p-4 bg-[#35363D] border-t border-white/10 z-10">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Checkbox
            id="auto-repeat"
            checked={autoRepeat}
            onCheckedChange={(checked) => setAutoRepeat(checked as boolean)}
            disabled={isVoting}
          />
          <label
            htmlFor="auto-repeat"
            className={`text-sm text-white/80 cursor-pointer ${isVoting ? 'opacity-50' : ''}`}
          >
            Auto-repeat this voting choice each future period
          </label>
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
            onClick={onSubmitVotes}
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
  );
}

export default EmissionsManagementFooter;
