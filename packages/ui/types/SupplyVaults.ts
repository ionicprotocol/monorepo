import type { Address, Hex } from 'viem';

export interface VaultRowData {
  asset: string;
  logo: string;
  strategy: {
    description: string;
    distribution: Array<{
      poolName: string;
      percentage: number;
    }>;
  };
  apr: {
    total: number;
    breakdown: Array<{
      source: string;
      value: number;
    }>;
  };
  totalSupply: {
    tokens: number;
    usd: number;
  };
  utilisation: number;
  userPosition: {
    tokens: number;
    usd: number;
  };
  vaultAddress: Hex;
  underlyingToken: Hex;
  underlyingDecimals: number;
  underlyingSymbol: string;
  cToken: Address;
}
