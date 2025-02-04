import React, { useCallback, useEffect, useRef, useState } from 'react';

import { PlusIcon, MinusIcon } from 'lucide-react';

import { Button } from '@ui/components/ui/button';
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
  const { votes, updateVote } = useVotes();
  const key = `${marketAddress}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(votes[key] || '');
  const [error, setError] = useState('');

  // Calculate other votes total only when needed
  const getOtherVotesTotal = useCallback(() => {
    return Object.entries(votes).reduce((sum, [voteKey, value]) => {
      if (voteKey !== key && value) {
        return sum + parseFloat(value);
      }
      return sum;
    }, 0);
  }, [votes, key]);

  const validateAndUpdate = useCallback(
    (newValue: string) => {
      if (newValue === '') {
        setError('');
        setLocalValue('');
        requestAnimationFrame(() => {
          updateVote(marketAddress, side, '');
        });
        return;
      }

      const numericValue = parseFloat(newValue);
      if (isNaN(numericValue) || numericValue < 0) {
        return;
      }

      const otherVotesTotal = getOtherVotesTotal();
      const totalWithNew = otherVotesTotal + numericValue;

      if (totalWithNew > 100) {
        const remaining = Math.max(0, 100 - otherVotesTotal);
        setError(`Max remaining: ${remaining.toFixed(2)}%`);
        return;
      }

      setError('');
      setLocalValue(newValue);
      requestAnimationFrame(() => {
        updateVote(marketAddress, side, newValue);
      });
    },
    [marketAddress, side, updateVote, getOtherVotesTotal]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
        validateAndUpdate(newValue);
      }
    },
    [validateAndUpdate]
  );

  const adjustValue = useCallback(
    (increment: boolean) => {
      const currentValue = parseFloat(localValue) || 0;
      const newValue = increment ? currentValue + 1 : currentValue - 1;

      if (newValue >= 0) {
        validateAndUpdate(newValue.toString());
      }
    },
    [localValue, validateAndUpdate]
  );

  // Sync with external votes changes
  useEffect(() => {
    setLocalValue(votes[key] || '');
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votes[key], key]);

  const otherVotesTotal = getOtherVotesTotal();
  const currentValue = parseFloat(localValue) || 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="w-6 h-6"
          onClick={() => adjustValue(false)}
          disabled={isDisabled || !localValue || parseFloat(localValue) <= 0}
        >
          <MinusIcon className="w-3 h-3" />
        </Button>

        <div className="relative">
          <Input
            ref={inputRef}
            value={localValue}
            className={`w-20 h-8 px-2 py-1 text-sm ${error ? 'border-red-500' : ''}`}
            onChange={handleChange}
            disabled={isDisabled}
            placeholder="0"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            %
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="w-6 h-6"
          onClick={() => adjustValue(true)}
          disabled={isDisabled || otherVotesTotal + currentValue >= 100}
        >
          <PlusIcon className="w-3 h-3" />
        </Button>
      </div>

      {error && (
        <span className="absolute left-0 top-10 text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
});

export default VoteInput;
