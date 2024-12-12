import { base, mode } from 'viem/chains';

export type EarnRow = {
  apr: number;
  asset: string[]; //name of the asset in uppercase array
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

export interface IRewards {
  peaks: boolean;
  turtle: boolean;
  velo?: string;
  aero?: boolean;
  points: Record<string, number>;
}

export const earnOpps: EarnRow[] = [
  {
    apr: 0,
    asset: ['ion'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    live: true,
    rewards: {
      [base.id]: {
        points: {
          ionic: 0,
          turtle: 0
        },
        peaks: false,
        turtle: false
      }
    },
    link: 'https://oyster.synfutures.com/#/trade/base/ETH-ION-EMG-Perpetual',
    network: 'base',
    protocol: 'SynFutures',
    strategy: 'Perps / Single Staking',
    img: '/img/symbols/32/color/synfutures.png',
    tvl: 0,
    poolChain: base.id
  },
  {
    apr: 0,
    asset: ['ionUSDC', 'ionUSDT'],
    getApr: async () => {
      try {
        const response = await fetch(
          'https://api.steer.finance/pool/fee-apr?address=0x17694615caba46ef765a3673fa488e04332b522a&chain=34443&interval=604800'
        );
        if (!response.ok) {
          throw new Error(`HTTP error: Status ${response.status}`);
        }
        const val = await response.json();
        return val?.apr ?? 0;
      } catch (err) {
        console.error(err);
      }
    },
    getTvl: async () => {
      try {
        const response = await fetch(
          'https://api.steer.finance/pool/lp/value?chain=34443&address=0x17694615caba46ef765a3673fa488e04332b522a'
        );
        if (!response.ok) {
          throw new Error(`HTTP error: Status ${response.status}`);
        }
        const val = await response.json();
        return val?.tvl ?? 0;
      } catch (err) {
        console.error(err);
      }
    },
    live: true,
    rewards: {
      [mode.id]: {
        points: {
          ionic: 3,
          turtle: 1
        },
        peaks: false,
        turtle: true
      }
    },
    link: 'https://app.steer.finance/vault/0x17694615caba46ef765a3673fa488e04332b522a/34443',
    network: 'mode',
    protocol: 'Steer',
    strategy: 'Liquidty Pool',
    img: '/img/symbols/32/color/steer.png',
    tvl: 0,
    poolChain: mode.id
  },
  {
    apr: 0,
    asset: ['ion'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    live: true,
    rewards: {
      [mode.id]: {
        points: {
          ionic: 0,
          turtle: 0
        },
        peaks: false,
        turtle: false
      }
    },
    link: 'https://peapods.finance/app?pod=0xFa1D1f89e64A1b5ba50fb867d2aa660D9E6dE029',
    network: 'mode',
    protocol: 'Peapods',
    strategy: 'Volatility Farming / Single Staking',
    img: '/img/symbols/32/color/peapods.png',
    tvl: 0,
    poolChain: mode.id
  },
  {
    apr: 0,
    asset: ['ion'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    live: true,
    rewards: {
      [mode.id]: {
        points: {
          ionic: 0,
          turtle: 0
        },
        peaks: false,
        turtle: false
      }
    },
    link: 'https://perps.ionic.money/',
    network: 'mode',
    protocol: 'Lynx',
    strategy: 'Perps / Single Staking',
    img: '/img/symbols/32/color/lynx.png',
    tvl: 0,
    poolChain: mode.id
  }
];
