export interface MorphoRow {
  asset: string[];
  protocol: string;
  strategy: string;
  network: string;
  apr: number;
  tvl: number;
  img: string;
  link: string;
  live: boolean;
  getApr?: () => Promise<number>;
  getTvl?: () => Promise<number>;
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
