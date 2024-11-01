'use client';

import React from 'react';

import { Card } from '@ui/components/ui/card';
import { Checkbox } from '@ui/components/ui/checkbox';

interface EmissionsManagementFooterProps {
  autoRepeat: boolean;
  setAutoRepeat: (value: boolean) => void;
  selectedRows: Record<string, string>;
  handleReset: () => void;
  onSubmitVotes?: () => Promise<void>;
  isVoting?: boolean;
}

function EmissionsManagementFooter({
  autoRepeat,
  setAutoRepeat,
  selectedRows,
  handleReset,
  onSubmitVotes,
  isVoting = false
}: EmissionsManagementFooterProps) {
  // Calculate total weight
  const totalWeight = Object.values(selectedRows).reduce(
    (sum, value) => sum + (parseFloat(value) || 0),
    0
  );

  const hasVotes = Object.keys(selectedRows).length > 0;
  const isValidWeight = Math.abs(totalWeight - 100) <= 0.01;

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
          {/* Show total weight */}
          <div
            className={`text-sm ${isValidWeight ? 'text-green-500' : 'text-red-500'}`}
          >
            Total: {totalWeight.toFixed(2)}%
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-white/60 hover:text-white/80 transition-colors border border-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasVotes || isVoting}
          >
            Reset
          </button>

          <button
            onClick={onSubmitVotes}
            disabled={!hasVotes || !isValidWeight || isVoting}
            className={`
              px-4 py-2 text-sm 
              ${
                hasVotes && isValidWeight && !isVoting
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
