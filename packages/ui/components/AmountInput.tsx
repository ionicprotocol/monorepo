import { cn } from '@ui/lib/utils';

const AmountInput = ({
  headerText,
  handleInput,
  readonly,
  amount,
  max,
  isLoading
}: {
  headerText?: string;
  handleInput?: (val?: string) => void;
  readonly?: boolean;
  amount?: string;
  max?: string;
  isLoading?: boolean;
}) => {
  const isDisabled = readonly || max === '0' || isLoading || !handleInput;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!handleInput) return;

    const value = e.target.value;
    if (value === '') {
      handleInput(undefined);
      return;
    }

    const numValue = parseFloat(value);
    const maxValue = max ? parseFloat(max) : 0;

    if (numValue > maxValue) {
      handleInput(max);
      return;
    }

    handleInput(value);
  }

  return (
    <div className="w-32">
      <div className="text-xs text-white/50 mb-1">{headerText}</div>
      <input
        className={cn(
          'w-full bg-transparent text-md border border-white/10 rounded px-2 py-1 focus:outline-none focus:border-white/20',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
        onChange={handleChange}
        placeholder="0.0"
        readOnly={isDisabled}
        disabled={isDisabled}
        type="number"
        value={amount}
        min="0"
        max={max}
      />
    </div>
  );
};

export default AmountInput;
