import { useVoting } from '@ui/app/contexts/VotingContext';
import { Input } from '@ui/components/ui/input';
import { MarketSide } from '@ui/hooks/veion/useVeIONVote';

interface VoteInputProps {
  marketAddress: string;
  side: MarketSide;
  isDisabled: boolean;
}

function VoteInput({ marketAddress, side, isDisabled }: VoteInputProps) {
  const { votes, updateVote } = useVoting();
  const key = `${marketAddress}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;

  return (
    <Input
      type="number"
      value={votes[key] || ''}
      className="w-20 h-8 px-2 py-1 text-sm"
      onChange={(e) => updateVote(marketAddress, side, e.target.value)}
      disabled={isDisabled}
      min="0"
      max="100"
      step="0.1"
    />
  );
}

export default VoteInput;
