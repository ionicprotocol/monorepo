import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Input } from '@ui/components/ui/input';
import { useVotes } from '@ui/context/VotesContext';
import { MarketSide } from '@ui/types/veION';

interface VoteInputProps {
  marketAddress: string;
  side: MarketSide;
  isDisabled: boolean;
}

const VoteInput = React.memo(function VoteInput({
  marketAddress,
  side,
  isDisabled
}: VoteInputProps) {
  // Use the votes context directly
  const { votes, updateVote } = useVotes();
  const key = `${marketAddress}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(votes[key] || '');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (
        newValue === '' ||
        (/^\d*\.?\d*$/.test(newValue) && parseFloat(newValue) <= 100)
      ) {
        setLocalValue(newValue);
        requestAnimationFrame(() => {
          updateVote(marketAddress, side, newValue);
        });
      }
    },
    [marketAddress, side, updateVote]
  );

  // Sync with external votes changes
  useEffect(() => {
    setLocalValue(votes[key] || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votes[key], key]);

  return (
    <div className="relative w-20">
      <Input
        value={votes[key] || ''}
        className="h-8 px-2 py-1 text-sm pr-6"
        onChange={handleChange}
        disabled={isDisabled}
        placeholder="0"
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
        %
      </span>
    </div>
  );
});

export default VoteInput;
