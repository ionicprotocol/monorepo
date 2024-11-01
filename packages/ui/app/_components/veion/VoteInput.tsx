import { useState, useEffect, memo } from 'react';

import { useVoting } from '@ui/app/contexts/VotingContext';
import { Input } from '@ui/components/ui/input';

interface VoteInputProps {
  row: any;
  disabled?: boolean;
}

const VoteInput = memo(({ row, disabled }: VoteInputProps) => {
  const { selectedRows, onVoteChange } = useVoting();
  const [value, setValue] = useState(selectedRows[row.original.id] || '');
  const id = row.original.id;
  const hasVotes = parseFloat(row.original.myVotes.percentage) > 0;

  useEffect(() => {
    setValue(selectedRows[id] || '');
  }, [id, selectedRows]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onVoteChange(id, newValue);
  };

  if (hasVotes) {
    return (
      <div className="text-xs font-semibold text-white/80">
        {row.original.myVotes.percentage} %
      </div>
    );
  }

  return (
    <div className="relative w-40">
      <Input
        id={`vote-input-${id}`}
        name={`vote-input-${id}`}
        className="bg-transparent border-blue-500/20 text-xs h-8 pr-12"
        value={value}
        onChange={handleChange}
        placeholder="Enter % vote"
        type="number"
        max={100}
        min={0}
        step="0.01"
        disabled={disabled}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 text-xs">
        MAX
      </span>
    </div>
  );
});

VoteInput.displayName = 'VoteInput';

export default VoteInput;
