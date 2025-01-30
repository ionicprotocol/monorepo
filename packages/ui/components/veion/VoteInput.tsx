import React, { useCallback } from 'react';
import { Input } from '@ui/components/ui/input';
import { useEmissionsContext } from '@ui/context/EmissionsManagementContext';
import { MarketSide } from '@ui/hooks/veion/useVeIONVote';

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
  const { votes, updateVote } = useEmissionsContext();
  const key = `${marketAddress}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (
        newValue === '' ||
        (/^\d*\.?\d*$/.test(newValue) && parseFloat(newValue) <= 100)
      ) {
        updateVote(marketAddress, side, newValue);
      }
    },
    [marketAddress, side, updateVote]
  );

  return (
    <Input
      type="text"
      value={votes[key] || ''}
      className="w-20 h-8 px-2 py-1 text-sm"
      onChange={handleChange}
      disabled={isDisabled}
      placeholder="0"
    />
  );
});

export default VoteInput;
