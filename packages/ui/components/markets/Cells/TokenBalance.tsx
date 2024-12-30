import { millify } from 'millify';
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
  tokenName
}) => {
  const formatNumber = (num: number) => {
    if (num === 0) return '0';

    if (Math.abs(num) < 0.01) {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      });
    }

    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatUSD = (num: number) => {
    if (num === 0) return '$0';

    if (Math.abs(num) < 0.01) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }).format(num);
    }

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
