import { Address, Hex } from 'viem';

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
    tokens: string;
    usd: string;
  };
  utilisation: number;
  userPosition: {
    tokens: string;
    usd: string;
  };
  vaultAddress: string;
  underlyingToken: Hex;
  underlyingDecimals: number;
  underlyingSymbol: string;
  cToken: Address;
}
