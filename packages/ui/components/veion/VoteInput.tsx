import React, { useCallback, useState, useRef } from 'react';

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

  const [inputValue, setInputValue] = useState(votes[key] || '');
  const [error, setError] = useState('');

  const getOtherVotesTotal = useCallback(() => {
    return Object.entries(votes).reduce((sum, [voteKey, value]) => {
      if (voteKey !== key && value) {
        return sum + parseFloat(value);
      }
      return sum;
    }, 0);
  }, [votes, key]);

  const validateAndUpdate = useCallback(
    (value: string) => {
      setError('');

      if (value === '') {
        updateVote(marketAddress, side, '');
        return;
      }

      const numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue < 0) {
        return;
      }

      if (votes[key] === value) {
        return;
      }

      const otherVotesTotal = getOtherVotesTotal();
      const totalWithNew = otherVotesTotal + numericValue;

      if (totalWithNew > 100) {
        const remaining = Math.max(0, 100 - otherVotesTotal);
        setError(`Max remaining: ${remaining.toFixed(2)}%`);
        return;
      }

      updateVote(marketAddress, side, value);
    },
    [marketAddress, side, updateVote, getOtherVotesTotal, votes, key]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
        setInputValue(newValue);

        if (newValue === '') {
          updateVote(marketAddress, side, '');
          setError('');
        }
      }
    },
    [updateVote, marketAddress, side]
  );

  const handleBlur = useCallback(() => {
    validateAndUpdate(inputValue);
  }, [inputValue, validateAndUpdate]);

  const adjustValue = useCallback(
    (increment: boolean) => {
      const currentValue = parseFloat(inputValue) || 0;
      const newValue = increment
        ? currentValue + 1
        : Math.max(0, currentValue - 1);

      const newValueStr = newValue.toString();
      setInputValue(newValueStr);

      if (!increment) {
        setError('');
      }

      if (!increment) {
        updateVote(marketAddress, side, newValueStr);
      } else {
        validateAndUpdate(newValueStr);
      }
    },
    [inputValue, validateAndUpdate, updateVote, marketAddress, side]
  );

  const otherVotesTotal = getOtherVotesTotal();
  const currentValue = parseFloat(inputValue) || 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="w-6 h-6"
          onClick={() => adjustValue(false)}
          disabled={isDisabled || !inputValue || parseFloat(inputValue) <= 0}
        >
          <MinusIcon className="w-3 h-3" />
        </Button>

        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            className={`w-20 h-8 px-2 py-1 text-sm ${error ? 'border-red-500' : ''}`}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
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
        <span className="absolute left-0 top-8.5 text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
});

export default VoteInput;
