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
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(decimals);
  };

  const formatUSD = (num: number) => {
    if (num === 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
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
