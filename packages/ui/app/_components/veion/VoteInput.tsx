import { Input } from '@ui/components/ui/input';
import { useEmissionsContext } from '@ui/context/EmissionsManagementContext';
import { MarketSide } from '@ui/hooks/veion/useVeIONVote';

interface VoteInputProps {
  marketAddress: string;
  side: MarketSide;
  isDisabled: boolean;
}

function VoteInput({ marketAddress, side, isDisabled }: VoteInputProps) {
  const { votes, updateVote } = useEmissionsContext();
  const key = `${marketAddress}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Only allow numbers and empty string
    if (
      newValue === '' ||
      (/^\d*\.?\d*$/.test(newValue) && parseFloat(newValue) <= 100)
    ) {
      updateVote(marketAddress, side, newValue);
    }
  };

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
}

export default VoteInput;
