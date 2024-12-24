import React from 'react';

type TokenBalanceProps = {
  balance: number;
  balanceUSD: number;
  tokenName?: string;
  decimals?: number;
};

const TokenBalance: React.FC<TokenBalanceProps> = ({
  balance,
  balanceUSD,
  tokenName,
  decimals = 4
}) => {
  const formatNumber = (num: number) => {
    if (num === 0) return '0';

    if (num >= 1000000) {
      const value = (num / 1000000).toFixed(2);
      return `${value.replace(/\.?0+$/, '')}M`;
    }

    if (num >= 1000) {
      const value = (num / 1000).toFixed(2);
      return `${value.replace(/\.?0+$/, '')}K`;
    }

    // Convert to fixed decimal places and trim trailing zeros
    const value = num.toFixed(decimals);
    return value.replace(/\.?0+$/, '');
  };

  const formatUSD = (num: number) => {
    if (num === 0) return '$0';

    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);

    // Remove trailing zeros after decimal point while keeping at least 2 digits
    return formatted.replace(/\.?0+$/, '');
  };

  return (
    <div className="flex flex-col items-start">
      <span>
        {formatNumber(balance)}
        {tokenName && <span className="ml-1">{tokenName}</span>}
      </span>
      <span className="text-xs text-white/40 font-light">
        {formatUSD(balanceUSD)}
      </span>
    </div>
  );
};

export default TokenBalance;
