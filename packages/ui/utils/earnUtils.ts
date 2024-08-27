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
  rewards: Record<number, IRewards>;
  live?: boolean;
};

export interface IRewards {
  peaks: boolean;
  turtle: boolean;
  points: Record<string, number>;
}

export const earnOpps: EarnRow[] = [
  {
    apr: 0,
    asset: ['ION', 'WETH'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
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
    link: '/stake?chain=34443&token=weth',
    network: 'mode',
    poolChain: mode.id,
    protocol: 'Velodrome',
    tvl: 0,
    tvlpool: '0xC6A394952c097004F83d2dfB61715d245A38735a'
  },
  {
    apr: 0,
    asset: ['ION', 'WETH'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    live: true,
    rewards: {
      [base.id]: {
        points: {
          ionic: 3,
          turtle: 1
        },
        peaks: false,
        turtle: true
      }
    },
    link: '/stake?chain=8453',
    network: 'base',
    poolChain: base.id,
    protocol: 'Aerodrome Finance',
    tvl: 0,
    tvlpool: '0x0FAc819628a7F612AbAc1CaD939768058cc0170c'
  },
  {
    apr: 0,
    asset: ['ION', 'MODE'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
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
    link: '/stake?chain=34443&token=mode',
    network: 'mode',
    poolChain: mode.id,
    protocol: 'Velodrome',
    tvl: 0,
    tvlpool: '0x690A74d2eC0175a69C0962B309E03021C0b5002E'
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
    tvl: 0,
    poolChain: mode.id
  },
  {
    apr: 0,
    asset: ['ionUSDC'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    live: true,
    rewards: {
      [mode.id]: {
        points: {
          ionic: 3,
          turtle: 1
        },
        peaks: true,
        turtle: true
      }
    },
    link: 'https://davos.xyz/app/loans/mint/?network=mode&token=ionUSDC',
    network: 'mode',
    protocol: 'Davos',
    tvl: 0,
    poolChain: mode.id
  },
  {
    apr: 0,
    asset: ['ionUSDT'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    live: true,
    rewards: {
      [mode.id]: {
        points: {
          ionic: 3,
          turtle: 1
        },
        peaks: true,
        turtle: true
      }
    },
    link: 'https://davos.xyz/app/loans/mint/?network=mode&token=ionUSDT',
    network: 'mode',
    protocol: 'Davos',
    tvl: 0,
    poolChain: mode.id
  },
  {
    apr: 0,
    asset: ['ionUSDT'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    live: false,
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
    link: 'https://www.tren.finance',
    network: 'mode',
    protocol: 'Tren',
    tvl: 0,
    poolChain: mode.id
  },
  {
    apr: 0,
    asset: ['ionUSDT'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    live: false,
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
    link: 'https://peapods.finance',
    network: 'mode',
    protocol: 'Peapods',
    tvl: 0,
    poolChain: mode.id
  },
  {
    apr: 0,
    asset: ['ionUSDT'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    live: false,
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
    link: '#',
    network: 'mode',
    protocol: 'Otomato',
    tvl: 0,
    poolChain: mode.id
  },
  {
    apr: 0,
    asset: ['ionUSDT'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    live: false,
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
    link: '#',
    network: 'mode',
    protocol: 'Lynx',
    tvl: 0,
    poolChain: mode.id
  }
];
