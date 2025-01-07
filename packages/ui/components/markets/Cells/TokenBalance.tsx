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
      // Find the first non-zero digit
      const str = num.toFixed(10);
      const firstNonZeroIndex = str.match(/[1-9]/)?.index || 0;

      // Get position after decimal point
      const decimalPosition = str.indexOf('.');
      const digitsAfterDecimal = firstNonZeroIndex - decimalPosition;

      // Show 2 more digits after the first non-zero digit
      return num.toFixed(digitsAfterDecimal + 2);
    }

    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatUSD = (num: number) => {
    if (num === 0) return '$0';

    if (Math.abs(num) < 0.01) {
      // Same logic as above but with currency formatting
      const str = num.toFixed(10);
      const firstNonZeroIndex = str.match(/[1-9]/)?.index || 0;
      const decimalPosition = str.indexOf('.');
      const digitsAfterDecimal = firstNonZeroIndex - decimalPosition;

      return '$' + (+num.toFixed(digitsAfterDecimal + 2)).toString();
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
