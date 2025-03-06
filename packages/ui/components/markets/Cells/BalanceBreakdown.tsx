import React from 'react';

type Token = {
  tokenSymbol: string;
  tokenAmount: number;
  tokenAmountUSD: number;
};

type BalanceBreakdownProps = {
  balance?: number;
  balanceUSD?: number;
  tokens: Token[];
};

const BalanceBreakdown: React.FC<BalanceBreakdownProps> = ({
  balance,
  balanceUSD,
  tokens
}) => {
  const formatUSD = (num: number) => {
    if (num === 0) return '$0';

    if (Math.abs(num) < 0.01) {
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

  const formatNumber = (num: number) => {
    if (num === 0) return '0';

    if (Math.abs(num) < 0.01) {
      const str = num.toFixed(10);
      const firstNonZeroIndex = str.match(/[1-9]/)?.index || 0;
      const decimalPosition = str.indexOf('.');
      const digitsAfterDecimal = firstNonZeroIndex - decimalPosition;

      return num.toFixed(digitsAfterDecimal + 2);
    }

    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="flex flex-col items-start">
      {balance && (
        <span className="text-white">{balance.toLocaleString('en-US')}</span>
      )}
      {balanceUSD && (
        <span className="text-white">{formatUSD(balanceUSD)}</span>
      )}
      {tokens.map((token, index) => (
        <span
          key={index}
          className="text-xs text-white/40 font-light"
        >
          {formatNumber(token.tokenAmount)} {token.tokenSymbol}
        </span>
      ))}
    </div>
  );
};

export default BalanceBreakdown;
