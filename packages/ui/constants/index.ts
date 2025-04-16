import {
  base,
  bob,
  fraxtal,
  lisk,
  metalL2,
  mode,
  optimism,
  superseed,
  worldchain
} from 'viem/chains';

import type { TxStep } from '@ui/types/ComponentPropsType';

import type { Address } from 'viem';

import {
  camptest,
  ink,
  ozeantest,
  soneium,
  swellchain
} from '@ionicprotocol/chains';
import { SupportedChainsArray } from '@ionicprotocol/types';

export const SUPPORTED_NETWORKS_REGEX = new RegExp(
  SupportedChainsArray.join('|')
);
export const VALID_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const ABILLY = 1e9;

export const shouldGetFeatured: Record<
  string,
  Record<number, Record<string, string>>
> = {
  featuredSupply: {
    [mode.id]: {
      '0': 'usdc',
      '1': 'usdc'
    },
    [optimism.id]: {
      '0': 'usdc'
    },
    [base.id]: {
      '0': 'usdc'
    },
    [bob.id]: {
      '0': 'usdc'
    },
    [fraxtal.id]: {
      '0': ''
    },
    [lisk.id]: {
      '0': ''
    }
  },
  featuredSupply2: {
    [mode.id]: {
      '0': 'weth',
      '1': 'weth'
    },
    [optimism.id]: {
      '0': 'weth'
    },
    [base.id]: {
      '0': 'weth'
    },
    [bob.id]: {
      '0': 'weth'
    },
    [fraxtal.id]: {
      '0': 'wfrxeth'
    },
    [lisk.id]: {
      '0': 'weth'
    }
  }
};

export const REWARDS_TO_SYMBOL: Record<number, Record<Address, string>> = {
  [mode.id]: {
    '0x18470019bF0E94611f15852F7e93cf5D65BC34CA': 'ION',
    '0xC6A394952c097004F83d2dfB61715d245A38735a': 'ION',
    '0x690A74d2eC0175a69C0962B309E03021C0b5002E': 'ION'
  },
  [base.id]: {
    '0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5': 'ION',
    '0xaB36452DbAC151bE02b16Ca17d8919826072f64a': 'RSR',
    '0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4': 'eUSD',
    '0xCc7FF230365bD730eE4B352cC2492CEdAC49383e': 'hyUSD',
    '0x0FAc819628a7F612AbAc1CaD939768058cc0170c': 'ION',
    '0x7002458B1DF59EccB57387bC79fFc7C29E22e6f7': 'OGN',
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 'USDC'
  },
  [optimism.id]: {
    '0x887d1c6A4f3548279c2a8A9D0FA61B5D458d14fC': 'ION'
  },
  [lisk.id]: {
    '0x3f608A49a3ab475dA7fBb167C1Be6b7a45cD7013': 'ION',
    '0xac485391EB2d7D88253a7F1eF18C37f4242D1A24': 'LSK'
  },
  [fraxtal.id]: {
    '0x5BD5c0cB9E4404C63526433BcBd6d133C1d73ffE': 'ION'
  }
};

export const chainIdToName: Record<number, string> = {
  [mode.id]: 'Mode',
  [base.id]: 'Base',
  [optimism.id]: 'Optimism',
  [bob.id]: 'Bob',
  [fraxtal.id]: 'Fraxtal',
  [lisk.id]: 'Lisk'
};

export const FLYWHEEL_TYPE_MAP: Record<
  number,
  Record<'borrow' | 'supply', Address[]>
> = {
  [mode.id]: {
    supply: ['0xE2805eB783AfF1D9140D27D660E26030F92bE029'],
    borrow: ['0x2912D204D5873A8b7b4b62CFC1DF1dcdC3eAd03a']
  },
  [base.id]: {
    supply: ['0x1eE8E310e992E7932A2a0964b29eC6d820f517A2'],
    borrow: ['0x8f88336f4A4fe791BA657541E1eA4e8F8BB841d2']
  },
  [optimism.id]: {
    supply: [
      '0x6671AfE7c3aBd9Db195b3e58D348166c21405B88',
      '0x4D01bb5710F1989b6C2Dde496a5400E7F3b88162',
      '0x05c3e910F7639457f92220605966e7f86A2ef966',
      '0xb988eE92A2B9A621187D33C845907DF5c5a1C9A3'
    ],
    borrow: [
      '0x6660174886cb3B26B38E5D4c1324E0BfB361F7CA',
      '0x030a6514049D0AF71cf89E51a01C9D82873F4a2b'
    ]
  },
  [lisk.id]: {
    supply: [
      '0x523F183ECbBf9144403D937B444d8486aD752453',
      '0x8A48245Db7D3572AD118D41b2F7dFf0aaBEF37A7',
      '0xdC737c91900097EF84c44885374527b26CD48d89'
    ],
    borrow: []
  },
  [fraxtal.id]: {
    supply: [
      '0xa54697FAF64721Ec6ddd13bC345bd733de17539D',
      '0xD07cd8Df6CCdC9228EBcEd7FA236E1d59C272164'
    ],
    borrow: [
      '0xf3E5172A9d701F3E5d98A1A846Eec7CC205A10dF',
      '0x738d34C11a66Ff56B95D2fC4DC1b3a954baB5da4'
    ]
  }
};

export const CLOSE_FACTOR = {
  DEFAULT: 50,
  MAX: 90,
  MIN: 5
};

type PoolParams = {
  hexcode?: string;
  accentbg?: string;
  arrow: string;
  bg: string;
  text: string;
  name: string;
  border: string;
  logo: string;
  pools: {
    id: string;
    name: string;
    assets: string[];
    shortName?: string;
  }[];
  vaults?: {
    id: string;
    name: string;
    description: string;
    assets: string[];
  }[];
};

export const NO_COLLATERAL_SWAP: Record<number, Record<string, string[]>> = {
  [mode.id]: {
    '0': ['dMBTC', 'msDAI', 'USDe', 'sUSDe', 'weETH']
  }
};

export const pools: Record<number, PoolParams> = {
  [base.id]: {
    name: 'Base',
    arrow: 'ffffff',
    hexcode: '#2467ed',
    bg: 'bg-blue-600',
    accentbg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-base',
    logo: '/img/logo/BASE.png',
    pools: [
      {
        id: '0',
        name: 'Main',
        assets: [
          'USDC',
          'WETH',
          'msETH',
          'msUSD',
          'wsuperOETHb',
          'OGN',
          'sUSDz',
          'USDz',
          'wUSD+',
          'wUSDM',
          'mBASIS',
          'uSOL',
          'uSUI',
          'uXRP',
          'EURC',
          'cbBTC',
          'eUSD',
          'bsdETH',
          'hyUSD',
          'ezETH',
          'weETH',
          'AERO',
          'RSR',
          'wstETH',
          'cbETH',
          'USD+',
          'fBOMB',
          'KLIMA'
        ]
      },
      {
        id: '1',
        name: 'Morpho Ionic',
        assets: ['WETH', 'USDC', 'ionicWETH', 'ionicUSDC'],
        shortName: 'Morpho Ionic'
      },
      {
        id: '3',
        name: 'Morpho Seamless',
        assets: ['smUSDC', 'USDC'],
        shortName: 'Morpho Seamless'
      }
    ]
    // vaults: [
    //   {
    //     id: 'vault',
    //     name: 'Supply Vaults',
    //     description: 'Optimized yield strategies',
    //     assets: ['USDC', 'WETH']
    //   }
    // ]
  },
  [mode.id]: {
    hexcode: '#3bff89',
    arrow: '000000',
    bg: 'bg-lime',
    accentbg: 'bg-accent',
    text: 'text-darkone',
    name: 'Mode',
    border: 'border-mode',
    logo: '/img/logo/MODE.png',
    pools: [
      {
        id: '0',
        name: 'Deprecated',
        assets: [
          'WETH',
          'USDC',
          'msDAI',
          'weETH.mode',
          'LBTC',
          'uniBTC',
          'oBTC',
          'uBTC',
          'M-BTC',
          'sUSDe',
          'wrsETH',
          'ezETH',
          'STONE',
          'WBTC',
          'USDe',
          'USDT',
          'weETH',
          'dMBTC'
        ]
      },
      {
        id: '1',
        name: 'Native Pool',
        assets: ['MODE', 'WETH', 'USDC', 'USDT']
      }
    ]
  },
  [optimism.id]: {
    name: 'Optimism',
    hexcode: '#ff0420',
    arrow: 'ffffff',
    bg: 'bg-optimism',
    accentbg: 'bg-optimism',
    text: 'text-white',
    border: 'border-optimism',
    logo: '/img/logo/OPTIMISM.png',
    pools: [
      {
        id: '0',
        name: 'Main',
        assets: [
          'USDC',
          'USDT',
          'WETH',
          'wUSDM',
          'weETH',
          'OP',
          'wstETH',
          'SNX',
          'WBTC',
          'LUSD'
        ]
      }
    ]
  },
  [bob.id]: {
    name: 'BoB',
    arrow: 'ffffff',
    bg: 'bg-bob',
    text: 'text-white',
    border: 'border-bob',
    logo: '/img/logo/BOB.png',
    pools: [
      {
        id: '0',
        name: 'Main',
        assets: ['USDC', 'USDT', 'WETH', 'WBTC', 'tBTC', 'SOV']
      }
    ]
  },
  [fraxtal.id]: {
    name: 'Fraxtal',
    arrow: 'ffffff',
    bg: 'bg-fraxtal',
    text: 'text-white',
    border: 'border-fraxtal',
    logo: '/img/logo/FRAXTAL.png',
    pools: [
      {
        id: '0',
        name: 'Main',
        assets: ['FRAX', 'wfrxETH', 'insfrxETH', 'sfrxETH', 'sFRAX', 'FXS']
      }
    ]
  },
  [lisk.id]: {
    name: 'Lisk',
    arrow: 'ffffff',
    bg: 'bg-lisk',
    text: 'text-white',
    border: 'border-lisk',
    logo: '/img/logo/Lisk.png',
    pools: [
      {
        id: '0',
        name: 'Main',
        assets: ['WETH', 'USDC', 'USDT', 'WBTC', 'LSK']
      }
    ]
  },
  [superseed.id]: {
    name: 'Superseed',
    arrow: 'ffffff',
    bg: 'bg-fraxtal',
    text: 'text-white',
    border: 'border-fraxtal',
    logo: '/img/logo/SUPERSEED.png',
    pools: [
      {
        id: '0',
        name: 'Main',
        assets: ['WETH']
      }
    ]
  },
  [worldchain.id]: {
    name: 'Worldchain',
    arrow: 'ffffff',
    bg: 'bg-fraxtal',
    text: 'text-white',
    border: 'border-fraxtal',
    logo: '/img/logo/WORLDCHAIN.png',
    pools: [
      {
        id: '0',
        name: 'Main',
        assets: ['WETH']
      }
    ]
  },
  [ink.chainId]: {
    name: 'Ink',
    arrow: 'ffffff',
    bg: 'bg-ink',
    text: 'text-white',
    border: 'border-ink',
    logo: '/img/logo/INK.png',
    pools: [
      {
        id: '0',
        name: 'Main',
        assets: ['WETH']
      }
    ]
  },
  [swellchain.chainId]: {
    name: 'Swell',
    arrow: 'ffffff',
    bg: 'bg-swell',
    text: 'text-white',
    border: 'border-swell',
    logo: '/img/logo/SWELL.png',
    pools: [
      {
        id: '0',
        name: 'Main',
        assets: ['WETH', 'USDe', 'rswETH', 'weETH']
      }
    ]
  },
  [camptest.chainId]: {
    name: 'Camp Testnet',
    arrow: 'ffffff',
    bg: 'bg-camp',
    text: 'text-white',
    border: 'border-camp',
    logo: '/img/logo/CAMP.png',
    pools: [{ id: '0', name: 'Main', assets: ['WETH'] }]
  },
  [ozeantest.chainId]: {
    arrow: 'ffffff',
    name: 'Ozean Testnet',
    hexcode: '#2467ed',
    bg: 'bg-blue-600',
    accentbg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-base',
    logo: '/img/logo/OZEAN.png',
    pools: [
      {
        id: '0',
        name: 'Main',
        assets: ['WUSDX']
      }
    ]
  },
  [soneium.chainId]: {
    name: 'Soneium',
    arrow: 'ffffff',
    bg: 'bg-fraxtal',
    text: 'text-white',
    border: 'border-fraxtal',
    logo: '/img/logo/SONEIUM.png',
    pools: [
      {
        id: '0',
        name: 'Main',
        assets: ['WETH', 'USDC', 'ASTR']
      }
    ]
  },
  [metalL2.id]: {
    name: 'MetalL2',
    arrow: 'ffffff',
    bg: 'bg-fraxtal',
    text: 'text-white',
    border: 'border-fraxtal',
    logo: '/img/logo/METALL2.png',
    pools: [
      {
        id: '0',
        name: 'Main Pool',
        assets: ['WETH']
      }
    ]
  }
};

export const DROPDOWN = {
  AirdropSZN1: 1,
  AirdropSZN2: 2,
  PublicSale: 0
};
// export const pools = [
//   {
//     chain: 34443,
//     id: '0',
//     name: 'Main Market'
//   },
//   {
//     chain: 34443,
//     id: '1',
//     name: 'Native Market'
//   },
//   {
//     chain: 8453,
//     id: '0',
//     name: 'Main Market'
//   }
// ];
export const LIQUIDATION_INCENTIVE = {
  DEFAULT: 8,
  MAX: 50,
  MIN: 0
};
export const INFO = {
  BORROW: 0,
  SUPPLY: 1
};
export const LOAN_TO_VALUE = {
  DEFAULT: 50,
  MAX: 90,
  MIN: 5
};

export const RESERVE_FACTOR = {
  DEFAULT: 10,
  MAX: 50,
  MIN: 0
};

export const ADMIN_FEE = {
  DEFAULT: 5,
  MAX: 30,
  MIN: 0
};

export const SUPPLY_CAP = {
  DEFAULT: 0,
  MIN: 0
};

export const BORROW_CAP = {
  DEFAULT: 0,
  MIN: 0
};

export const DEBT_CEILING = {
  DEFAULT: 0,
  MIN: -1 // -1: blacklisted, 0: unlimited
};

export const SUPPLY_CAP_WHITELIST = {
  DEFAULT: ''
};

export const BORROW_CAP_WHITELIST = {
  DEFAULT: ''
};

export const ASSET_BLACKLIST_WHITELIST = {
  DEFAULT: ''
};

export const DEBT_CEILING_WHITELIST = {
  DEFAULT: ''
};

export const POOLS_PER_PAGE = 6;

// TODO: We should replace this with NATIVE_DECIMALS from the @midas-capital/chains package
export const DEFAULT_DECIMALS = 18;

// enums

export const MINUTES_PER_YEAR = 24 * 365 * 60;

export const UP_LIMIT = 0.005;
export const DOWN_LIMIT = 0;

// for additional APR for ankrBNB in Ankr
export const ankrBNBContractAddress =
  '0xCb0006B31e6b403fEeEC257A8ABeE0817bEd7eBa';
export const aprDays = 7;
export const ankrBNBContractABI = [
  {
    inputs: [
      { internalType: 'address', name: 'addr', type: 'address' },
      { internalType: 'uint256', name: 'day', type: 'uint256' }
    ],
    name: 'averagePercentageRate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

export const MARKETS_COUNT_PER_PAGE = [25, 50, 75];
export const VAULTS_COUNT_PER_PAGE = [25, 50, 75];
export const POSITION_CREATION_PER_PAGE = [25, 50, 75];
export const CREATED_POSITION_PER_PAGE = [25, 50, 75];
export const POOLS_COUNT_PER_PAGE = [25, 50, 75];

export const REWARDS = 'Rewards';
export const COLLATERAL = 'Collateral';
export const PROTECTED = 'Protected';
export const BORROWABLE = 'Borrowable';
export const DEPRECATED = 'Deprecated';
export const PAUSED = 'Paused';
export const SEARCH = 'Search';
export const HIDDEN = 'Hiden';
export const ALL = 'All';

export const RESERVE_FACTOR_TOOLTIP =
  'The reserve factor defines the portion of borrower interest that is converted into reserves.';
export const ADMIN_FEE_TOOLTIP =
  "The fraction of interest generated on a given asset that is routed to the asset's admin address as a fee.";
export const LOAN_TO_VALUE_TOOLTIP =
  'The Loan to Value (LTV) ratio defines the maximum amount of tokens in the pool that can be borrowed with a specific collateral. It’s expressed in percentage: if in a pool ETH has 75% LTV, for every 1 ETH worth of collateral, borrowers will be able to borrow 0.75 ETH worth of other tokens in the pool.';
export const PERFORMANCE_FEE_TOOLTIP =
  'The fee taken by Midas Capital, as a percentage of the rewards earned by this strategy';
export const ASSET_SUPPLIED_TOOLTIP =
  'Total Supply of this asset is limited for the overall safety of this pool';
export const ASSET_BORROWED_TOOLTIP =
  'Total Borrow of this asset is limited for the overall safety of this pool';
export const SUPPLY_CAP_WHITELIST_TOOLTIP =
  'Add or remove address with no supply cap';
export const BORROW_CAP_WHITELIST_TOOLTIP =
  'Add or remove address with no borrow cap';
export const DEBT_CEILING_WHITELIST_TOOLTIP =
  'Add or remove address with no debt ceilings';
export const MIDAS_LOCALSTORAGE_KEYS = 'midas_localstorage_keys';
export const SHRINK_ASSETS = 10;
export const MIDAS_T_AND_C_ACCEPTED = 'MidasTandCAccepted';
export const SUPPLY_STEPS = (symbol: string) =>
  [
    { desc: 'Allow Midas to use your tokens', done: false, title: 'Approve' },
    {
      desc: 'Allows supplied assets to be used as collateral',
      done: false,
      title: 'Enable Collateral'
    },
    {
      desc: `Mints tokens which represent your share in the ${symbol} market`,
      done: false,
      title: 'Mint Market Share'
    }
  ] as TxStep[];

export const SWAP_STEPS = (inputSymbol: string, outputSymbol: string) =>
  [
    { desc: 'Allow Midas to use your tokens', done: false, title: 'Approve' },
    {
      desc: `Swaps from ${inputSymbol} to get ${outputSymbol}`,
      done: false,
      title: 'Swap'
    }
  ] as TxStep[];
export const BORROW_STEPS = (symbol: string) =>
  [
    { desc: `Borrows ${symbol} from the pool`, done: false, title: 'Borrow' }
  ] as TxStep[];
export const WITHDRAW_STEPS = (symbol: string) =>
  [
    {
      desc: `Withdraws supplied liquidity of ${symbol} from the pool`,
      done: false,
      title: 'Withdraw'
    }
  ] as TxStep[];
export const REPAY_STEPS = (symbol: string) =>
  [
    { desc: 'Allow Midas to use your tokens', done: false, title: 'Approve' },
    {
      desc: `Repays a borrow position of ${symbol} token`,
      done: false,
      title: 'Repay'
    }
  ] as TxStep[];
export const CREATE_NEW_POSITION_STEPS = (symbol: string) =>
  [
    { desc: 'Allow Midas to use your tokens', done: false, title: 'Approve' },
    {
      desc: `Creates new levered position with ${symbol} market`,
      done: false,
      title: 'Create position'
    }
  ] as TxStep[];

export const ADJUST_LEVERAGE_RATIO_STEPS = (symbol: string) =>
  [
    {
      desc: `Adjusts leverage ratio on ${symbol} market`,
      done: false,
      title: 'Adjust leverage ratio'
    }
  ] as TxStep[];

export const CLOSE_OPEN_POSITION_STEPS = (symbol: string) =>
  [
    {
      desc: `Closes open levered position with ${symbol} market`,
      done: false,
      title: 'Close position'
    }
  ] as TxStep[];

export const REMOVE_CLOSED_POSITION_STEPS = (symbol: string) =>
  [
    {
      desc: `Removes closed levered position with ${symbol} market`,
      done: false,
      title: 'Remove position'
    }
  ] as TxStep[];

export const FUND_POSITION_STEPS = (symbol: string) =>
  [
    { desc: 'Allow Midas to use your tokens', done: false, title: 'Approve' },
    {
      desc: `Funds position with ${symbol} market`,
      done: false,
      title: 'Fund position'
    }
  ] as TxStep[];

export const SCORE_LIMIT = 0.6;
export const SCORE_RANGE_MAX = 10;
export const MARKET_LTV = 'Market / LTV';
export const SUPPLY_APY = 'Supply APY';
export const BORROW_APY = 'Borrow APY';
export const SUPPLY_BALANCE = 'Supply Balance';
export const BORROW_BALANCE = 'Borrow Balance';
export const TOTAL_SUPPLY = 'Total Supply';
export const TOTAL_BORROW = 'Total Borrow';
export const LIQUIDITY = 'Liquidity';
export const MARKET_COLUMNS = [
  MARKET_LTV,
  SUPPLY_APY,
  BORROW_APY,
  SUPPLY_BALANCE,
  BORROW_BALANCE,
  TOTAL_SUPPLY,
  TOTAL_BORROW,
  LIQUIDITY
];

export const VAULT = 'Vault';
export const VAULT_COLUMNS = [VAULT, SUPPLY_APY, TOTAL_SUPPLY];

export const COLLATERAL_ASSET = 'Collateral';
export const POSITION_VALUE = 'Position Value';
export const POSITION_VALUE_TOOLTIP = 'Total value of your farming position';
export const DEBT_VALUE = 'Debt Value';
export const DEBT_VALUE_TOOLTIP = 'Total debt value of your farming position';
export const EQUITY_VALUE = 'Equity Value';
export const EQUITY_VALUE_TOOLTIP =
  'Estimated value you would get if you closed your position';
export const NET_APY_TOOLTIP = 'APY calculated based on current leverage';
export const DEBT_RATIO = 'Debt Ratio';
export const DEBT_RATIO_TOOLTIP = 'Debt Value / Position Value';
export const SAFETY_BUFFER = 'Safety Buffer';
export const SAFETY_BUFFER_TOOLTIP =
  'Buffer between the current Debt Ratio and the Liquidation Threshold';
export const LIQUIDATION_THRESHOLD = 'Liquidation Threshold';
export const LIQUIDATION_THRESHOLD_TOOLTIP =
  'Debt Ratio threshold. Beyond this limit, your position could be liquidated';
export const BORROWABLE_ASSET = 'Borrowable';
export const NET_APY = 'Net APY';
export const POSITION_CREATION_COLUMNS = [
  COLLATERAL_ASSET,
  SUPPLY_APY,
  NET_APY,
  BORROWABLE_ASSET
];
export const CREATED_POSITIONS_COLUMNS = [
  COLLATERAL_ASSET,
  SUPPLY_APY,
  NET_APY,
  BORROWABLE_ASSET
];
export const POOL_NAME = 'Pool Name';
export const ASSETS = 'Assets';
export const CHAIN = 'Chain';
export const EXPANDER = 'Expander';

export const POOLS_COLUMNS = [
  CHAIN,
  POOL_NAME,
  ASSETS,
  SUPPLY_BALANCE,
  BORROW_BALANCE,
  TOTAL_SUPPLY,
  TOTAL_BORROW,
  EXPANDER
];
export const COINGECKO_API =
  'https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=';
export const FEATURE_REQUESTS_URL =
  'https://midascapital.canny.io/feature-requests';
export const DEFI_LLAMA_API = 'https://coins.llama.fi/prices/current/';
export const HIGH_RISK_RATIO = 0.8;

export const VAULT_SUPPLY_STEPS = (symbol: string) =>
  [
    { desc: 'Allow Midas to use your tokens', done: false, title: 'Approve' },
    {
      desc: `Mints tokens which represent your share in the ${symbol} vault`,
      done: false,
      title: 'Mint Vault Share'
    }
  ] as TxStep[];

export const VAULT_WITHDRAW_STEPS = (symbol: string) =>
  [
    {
      desc: `Withdraws supplied liquidity of ${symbol} from the vault`,
      done: false,
      title: 'Withdraw'
    }
  ] as TxStep[];

export const PRICE = 'Price';
export const TVL = 'TVL';
export const APY = 'APY';
export const MILLI_SECONDS_PER_DAY = 24 * 60 * 60 * 1000;
export const MILLI_SECONDS_PER_WEEK = MILLI_SECONDS_PER_DAY * 7;
export const MILLI_SECONDS_PER_MONTH = MILLI_SECONDS_PER_DAY * 30;
export const MILLI_SECONDS_PER_YEAR = MILLI_SECONDS_PER_DAY * 365;

export const ADD = 'Add';
export const REMOVE = 'Remove';

export const LEVERAGE_VALUE = {
  DEFAULT: 1.0,
  MAX: 3.0,
  MIN: 1.0
};

export const NON_BORROWABLE_SYMBOLS = ['ezETH'];

export const INFO_MESSAGES = {
  ADJUST_LEVERAGE: {
    ADJUSTING: 'Adjusting leverage'
  },
  BORROW: {
    BORROWING: 'Borrowing funds'
  },
  CLOSE_POSITION: {
    CLOSING: 'Closing position'
  },
  COLLATERAL: {
    DISABLE: 'Disabling collateral',
    ENABLE: 'Enabling collateral'
  },
  FUNDING_POSITION: {
    APPROVE: 'Approve amount for spending',
    FUNDING: 'Funding position'
  },
  OPEN_POSITION: {
    APPROVE: 'Approve amount for spending',
    OPENING: 'Opening position'
  },
  REPAY: {
    APPROVE: 'Approve amount for spending',
    REPAYING: 'Repaying'
  },
  SUPPLY: {
    APPROVE: 'Approve amount for spending',
    COLLATERAL: 'Enable as collateral',
    SUPPLYING: 'Add to supply'
  },
  WITHDRAW: {
    WITHDRAWING: 'Withdrawing funds'
  },
  SWAP: {
    APPROVE: 'Approve amount for spending',
    SWAPPING: 'Swapping'
  }
};
