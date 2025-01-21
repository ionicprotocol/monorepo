export interface TVLData {
  tokenAmount: number;
  usdValue: number;
}

export interface MorphoRow {
  asset: string[];
  protocol: string;
  strategy: string;
  network: string;
  apy: number;
  tvl: TVLData;
  img: string;
  link: string;
  live: boolean;
  getApr?: () => Promise<number>;
  getTvl?: () => Promise<TVLData>;
  rewards: {
    morpho: number;
    rate: number;
    ION: number;
  };
}

export type EarnRow = {
  apr: number;
  asset: string[];
  getApr?: () => Promise<number>;
  getTvl?: () => Promise<number>;
  link: string;
  network: string;
  poolChain: number;
  protocol: string;
  tvl: number;
  tvlpool?: string;
  img: string;
  strategy: string;
  rewards: Record<number, IRewards>;
  live?: boolean;
};

interface IRewards {
  peaks: boolean;
  turtle: boolean;
  velo?: string;
  aero?: boolean;
  points: Record<string, number>;
}
