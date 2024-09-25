import { SupportedChainsArray } from '@ionicprotocol/types';
import { type Address } from 'viem';
import { base, bob, fraxtal, mode, optimism } from 'viem/chains';

import type { TxStep } from '@ui/types/ComponentPropsType';

export const explorerLinks: Record<number, string> = {
  [mode.id]: 'https://explorer.mode.network',
  [base.id]: 'https://basescan.org',
  [optimism.id]: 'https://optimistic.etherscan.io',
  [bob.id]: 'https://explorer.gobob.xyz',
  [fraxtal.id]: 'https://fraxscan.com'
};

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
    }
  }
};

export const REWARDS_TO_SYMBOL: Record<number, Record<Address, string>> = {
  [mode.id]: {
    '0x18470019bF0E94611f15852F7e93cf5D65BC34CA': 'ION'
  },
  [base.id]: {
    '0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5': 'ION',
    '0xaB36452DbAC151bE02b16Ca17d8919826072f64a': 'RSR',
    '0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4': 'eUSD',
    '0xCc7FF230365bD730eE4B352cC2492CEdAC49383e': 'hyUSD'
  },
  [optimism.id]: {
    '0x887d1c6A4f3548279c2a8A9D0FA61B5D458d14fC': 'ION'
  }
};

export const chainsArr: Record<number, string> = {
  34443: 'Mode',
  8453: 'Base',
  10: 'Optimism',
  60808: 'Bob',
  252: 'Frax'
};

export const scans: Record<number, string> = {
  34443: 'https://explorer.mode.network/tx/',
  8453: 'https://basescan.org/tx/',
  10: 'https://optimistic.etherscan.io/tx/',
  60808: 'https://explorer.gobob.xyz/tx/',
  252: 'https://fraxscan.com/tx/'
};

export const FLYWHEEL_TYPE_MAP: Record<
  number,
  Record<'borrow' | 'supply', Address[]>
> = {
  [mode.id]: {
    supply: ['0xcC11Fc7048db155F691Cc20Ac9958Fc465fa0062'],
    borrow: ['0x2DC3f7B18e8F62F7fE7819596D15E521EEf3b1ec']
  },
  [base.id]: {
    supply: [
      '0xE4E74A0c98b8dEa4bcbB870C9391Bb73a230ced4',
      '0x6e93f617AB6CEfFec7c276B4fD4c136B7A7aDD54',
      '0x5Dc1fd5cFA5F1efdaCBC790b41A2BfB41bf4F122',
      '0xf638994B1155DfE2cbDd9589365960DD8dcDE6B4',
      '0xc39441b305705AfD07de97237bC835a4501AbbEC'
      // '0xCc7FF230365bD730eE4B352cC2492CEdAC49383e'
    ],
    borrow: [
      '0x327410E4D3A32EF37712e77fCB005e5327F082De',
      '0x6aC943b6Ab1f759ECc67Ed56b7413f085fBE525d',
      '0xf9cef193bAC6103405228e4B29Ba8abab5A1001D'
    ]
  },
  [optimism.id]: {
    supply: ['0x4D01bb5710F1989b6C2Dde496a5400E7F3b88162'],
    borrow: []
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
  }[];
};

export const pools: Record<number, PoolParams> = {
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
        name: 'Main Pool',
        assets: [
          'WETH',
          'USDC',
          'msDAI',
          'weETH.mode',
          'dMBTC',
          'M-BTC',
          'sUSDe',
          'wrsETH',
          'ezETH',
          'STONE',
          'WBTC',
          'USDe',
          'USDT',
          'weETH'
        ]
      },
      {
        id: '1',
        name: 'Native Pool',
        assets: ['MODE', 'WETH', 'USDC', 'USDT']
      }
    ]
  },
  [base.id]: {
    hexcode: '#2467ed',
    name: 'Base',
    arrow: 'ffffff',
    bg: 'bg-blue-600',
    accentbg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-base',
    logo: '/img/logo/BASE.png',
    pools: [
      {
        id: '0',
        name: 'Main Pool',
        assets: [
          'USDC',
          'WETH',
          'wsuperOETHb',
          'wUSDM',
          'cbBTC',
          'eUSD',
          'bsdETH',
          'hyUSD',
          'ezETH',
          'weETH.mode',
          'AERO',
          'RSR',
          'wstETH',
          'cbETH'
        ]
      }
    ]
  },
  [optimism.id]: {
    name: 'Optimism',
    arrow: 'ffffff',
    bg: 'bg-optimism',
    text: 'text-white',
    border: 'border-optimism',
    logo: '/img/logo/OPTIMISM.png',
    pools: [
      {
        id: '0',
        name: 'Main Pool',
        assets: [
          'USDC',
          'USDT',
          'WETH',
          'wUSDM',
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
        name: 'Main Pool',
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
        name: 'Main Market',
        assets: ['FRAX', 'wfrxETH', 'FXS']
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

export enum FusePoolMetric {
  totalLiquidityNative,
  totalSuppliedNative,
  totalBorrowedNative
}

export enum UserAction {
  NO_ACTION,
  WAITING_FOR_TRANSACTIONS
}

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
export const FEATURE_REQUESTS_URL =
  'https://midascapital.canny.io/feature-requests';
export const COINGECKO_API =
  'https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=';
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
  }
};
