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
    return millify(num, {
      precision: 2,
      lowercase: true,
      space: true,
      units: ['', 'k', 'm', 'b', 't']
    });
  };

  const formatUSD = (num: number) => {
    if (num === 0) return '$0';
    return (
      '$' +
      millify(num, {
        precision: 2,
        lowercase: true,
        space: true,
        units: ['', 'k', 'm', 'b', 't']
      })
    );
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
