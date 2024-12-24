import { base, optimism, mode } from 'viem/chains';

export type VoteMarket = {
  asset: string;
  marketAddress: `0x${string}`;
  poolType: 0 | 1;
};

export type VoteMarketsConfig = Record<number, Record<string, VoteMarket[]>>;

export const voteMarkets: VoteMarketsConfig = {
  [mode.id]: {
    '0': [
      {
        asset: 'M-BTC',
        marketAddress: '0x1234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'dMBTC',
        marketAddress: '0x2345678901234567890123456789012345678901',
        poolType: 0
      },
      {
        asset: 'STONE',
        marketAddress: '0x3456789012345678901234567890123456789012',
        poolType: 0
      },
      {
        asset: 'USDC',
        marketAddress: '0x4567890123456789012345678901234567890123',

        poolType: 0
      },
      {
        asset: 'USDT',
        marketAddress: '0x5678901234567890123456789012345678901234',
        poolType: 0
      },
      {
        asset: 'WBTC',
        marketAddress: '0x6789012345678901234567890123456789012345',
        poolType: 0
      },
      {
        asset: 'WETH',
        marketAddress: '0x7890123456789012345678901234567890123456',

        poolType: 0
      },
      {
        asset: 'ezETH',
        marketAddress: '0x8901234567890123456789012345678901234567',
        poolType: 0
      },
      {
        asset: 'sUSDe',
        marketAddress: '0x9012345678901234567890123456789012345678',

        poolType: 0
      },
      {
        asset: 'USDe',
        marketAddress: '0xa123456789012345678901234567890123456789',

        poolType: 0
      },
      {
        asset: 'msDAI',
        marketAddress: '0xb123456789012345678901234567890123456789',
        poolType: 0
      },
      {
        asset: 'weETH',
        marketAddress: '0xc123456789012345678901234567890123456789',

        poolType: 0
      },
      {
        asset: 'wrsETH',
        marketAddress: '0xd123456789012345678901234567890123456789',
        poolType: 0
      }
    ],
    '1': [
      {
        asset: 'MODE',
        marketAddress: '0xe123456789012345678901234567890123456789',
        poolType: 1
      },
      {
        asset: 'USDC',
        marketAddress: '0xf123456789012345678901234567890123456789',
        poolType: 1
      },
      {
        asset: 'USDT',
        marketAddress: '0x0123456789012345678901234567890123456789',

        poolType: 1
      },
      {
        asset: 'WETH',
        marketAddress: '0x1234567890123456789012345678901234567890',
        poolType: 1
      }
    ]
  },
  [base.id]: {
    '0': [
      {
        asset: 'eUSD',
        marketAddress: '0x2234567890123456789012345678901234567890',

        poolType: 0
      },
      {
        asset: 'bsdETH',
        marketAddress: '0x3234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'hyUSD',
        marketAddress: '0x4234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'AERO',
        marketAddress: '0x5234567890123456789012345678901234567890',

        poolType: 0
      },
      {
        asset: 'USDC',
        marketAddress: '0x6234567890123456789012345678901234567890',

        poolType: 0
      },
      {
        asset: 'WETH',
        marketAddress: '0x7234567890123456789012345678901234567890',

        poolType: 0
      },
      {
        asset: 'cbETH',
        marketAddress: '0x8234567890123456789012345678901234567890',

        poolType: 0
      },
      {
        asset: 'ezETH',
        marketAddress: '0x9234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'weETH',
        marketAddress: '0xa234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'RSR',
        marketAddress: '0xb234567890123456789012345678901234567890',

        poolType: 0
      },
      {
        asset: 'wstETH',
        marketAddress: '0xc234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'wsuperOETHb',
        marketAddress: '0xd234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'wUSDM',
        marketAddress: '0xe234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'USD+',
        marketAddress: '0xf234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'wUSD+',
        marketAddress: '0x1334567890123456789012345678901234567890',

        poolType: 0
      },
      {
        asset: 'USDz',
        marketAddress: '0x2334567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'EURC',
        marketAddress: '0x3334567890123456789012345678901234567890',

        poolType: 0
      },
      {
        asset: 'cbBTC',
        marketAddress: '0x4334567890123456789012345678901234567890',

        poolType: 0
      },
      {
        asset: 'uSOL',
        marketAddress: '0x5334567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'uSUI',
        marketAddress: '0x6334567890123456789012345678901234567890',

        poolType: 0
      },
      {
        asset: 'sUSDz',
        marketAddress: '0x7334567890123456789012345678901234567890',

        poolType: 0
      }
    ]
  },
  [optimism.id]: {
    '0': [
      {
        asset: 'WETH',
        marketAddress: '0x5234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'USDC',
        marketAddress: '0x6234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'wstETH',
        marketAddress: '0x7234567890123456789012345678901234567890',

        poolType: 0
      },
      {
        asset: 'wUSDM',
        marketAddress: '0x8234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'SNX',
        marketAddress: '0x9234567890123456789012345678901234567890',
        poolType: 0
      },
      {
        asset: 'weETH',
        marketAddress: '0xa234567890123456789012345678901234567890',
        poolType: 0
      }
    ]
  }
};
