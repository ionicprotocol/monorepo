import React, { useState, useEffect } from 'react';

interface SlippageDropdownProps {
  onSlippageChange: (effectiveSlippage: number) => void;
}

export const SlippageDropdown: React.FC<SlippageDropdownProps> = ({
  onSlippageChange
}) => {
  const [slippageOption, setSlippageOption] = useState<string>('1');

  const handleSlippageOptionChange = (value: string) => {
    setSlippageOption(value);
  };

  const getEffectiveSlippage = (slippageOption: string) => {
    return parseFloat(slippageOption) / 100;
  };

  useEffect(() => {
    onSlippageChange(getEffectiveSlippage(slippageOption));
  }, [slippageOption, onSlippageChange]);

  return (
    <div className="text-xs mb-3 flex items-center">
      <span className="mr-2">Slippage Tolerance:</span>
      <select
        className="bg-graytwo text-white px-2 py-1 rounded"
        value={slippageOption}
        onChange={(e) => handleSlippageOptionChange(e.target.value)}
      >
        <option value="0.5">0.5%</option>
        <option value="1">1%</option>
        <option value="5">5%</option>
      </select>
    </div>
  );
};
