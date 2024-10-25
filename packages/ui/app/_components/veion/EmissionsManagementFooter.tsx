'use client';

import React from 'react';

import { Card } from '@ui/components/ui/card';
import { Checkbox } from '@ui/components/ui/checkbox';

function EmissionsManagementFooter({
  autoRepeat,
  setAutoRepeat,
  selectedRows,
  handleReset
}: {
  autoRepeat: boolean;
  setAutoRepeat: (value: boolean) => void;
  selectedRows: Record<string, string>;
  handleReset: () => void;
}) {
  return (
    <Card className="fixed bottom-4 left-4 right-4 p-4 bg-[#35363D] border-t border-white/10 z-10">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Checkbox
            id="auto-repeat"
            checked={autoRepeat}
            onCheckedChange={(checked) => setAutoRepeat(checked as boolean)}
          />
          <label
            htmlFor="auto-repeat"
            className="text-sm text-white/80 cursor-pointer"
          >
            Auto-repeat this voting choice each future period
          </label>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-white/60 hover:text-white/80 transition-colors border border-white/20 rounded-lg"
          >
            Reset
          </button>
          <button
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('Voting with:', selectedRows);
            }}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Vote
          </button>
        </div>
      </div>
    </Card>
  );
}

export default EmissionsManagementFooter;
