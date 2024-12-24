import { useState, useEffect } from 'react';

import { Slider } from '@ui/components/ui/slider';

interface PrecisionSliderProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  step?: number;
  marks?: number[];
  className?: string;
}

export function PrecisionSlider({
  value,
  onChange,
  max = 100,
  min = 0,
  step = 1,
  marks,
  className
}: PrecisionSliderProps) {
  return (
    <div className="w-full">
      {marks && (
        <div className="w-full mb-2 text-xs flex justify-between text-white/25">
          {marks.map((mark) => (
            <span
              key={mark}
              className={value >= mark ? 'text-accent' : ''}
            >
              {mark}%
            </span>
          ))}
        </div>
      )}
      <Slider
        value={[value]}
        onValueChange={(val) => onChange(Math.round(val[0]))}
        max={max}
        min={min}
        step={step}
        className={`[&_[role=slider]]:bg-accent [&_[role=slider]]:border-0 ${className || ''}`}
      />
    </div>
  );
}

interface UsePrecisionSliderProps {
  maxValue: number;
  initialValue?: number;
  precision?: number;
}

export function usePrecisionSlider({
  maxValue,
  initialValue = 0,
  precision = 2
}: UsePrecisionSliderProps) {
  const [amount, setAmount] = useState<number>(initialValue);
  const [percentage, setPercentage] = useState<number>(0);

  // Update percentage when amount changes
  useEffect(() => {
    const newPercentage = Math.round((amount / maxValue) * 100);
    setPercentage(newPercentage);
  }, [amount, maxValue]);

  // Handle amount change (from input)
  const handleAmountChange = (newAmount: number) => {
    setAmount(Number(newAmount.toFixed(precision)));
  };

  // Handle percentage change (from slider)
  const handlePercentageChange = (newPercentage: number) => {
    const rounded = Math.round(newPercentage);
    setPercentage(rounded);
    const newAmount = Number(((rounded / 100) * maxValue).toFixed(4));
    setAmount(newAmount);
  };

  return {
    amount,
    percentage,
    handleAmountChange,
    handlePercentageChange
  };
}
