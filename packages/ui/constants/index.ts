import { SupportedChainsArray } from '@midas-capital/types';

import { TxStep } from '@ui/types/ComponentPropsType';

export const SUPPORTED_NETWORKS_REGEX = new RegExp(SupportedChainsArray.join('|'));
export const VALID_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const ABILLY = 1e9;

export const MIDAS_DOCS_URL = 'https://docs.midascapital.xyz/';
export const MIDAS_SECURITY_DOCS_URL =
  'https://docs.midascapital.xyz/security/security-outline/4626-strategy-risk-scoring';
export const MIDAS_DISCORD_URL = 'https://discord.gg/85YxVuPeMt';
export const MIDAS_TELEGRAM_URL = 'https://t.me/midascapitaltg';
export const MIDAS_TWITTER_URL = 'https://twitter.com/MidasCapitalxyz';

export const CLOSE_FACTOR = {
  DEFAULT: 50,
  MIN: 5,
  MAX: 90,
};

export const LIQUIDATION_INCENTIVE = {
  DEFAULT: 8,
  MIN: 0,
  MAX: 50,
};

export const LOAN_TO_VALUE = {
  DEFAULT: 50,
  MIN: 5,
  MAX: 90,
};

export const RESERVE_FACTOR = {
  DEFAULT: 10,
  MIN: 0,
  MAX: 50,
};

export const ADMIN_FEE = {
  DEFAULT: 5,
  MIN: 0,
  MAX: 30,
};

export const SUPPLY_CAPS = {
  MIN: 0,
  DEFAULT: 0,
};

export const POOLS_PER_PAGE = 6;

// TODO: We should replace this with NATIVE_DECIMALS from the @midas-capital/chains package
export const DEFAULT_DECIMALS = 18;

// enums

export enum FusePoolMetric {
  totalLiquidityNative,
  totalSuppliedNative,
  totalBorrowedNative,
}

export enum UserAction {
  NO_ACTION,
  WAITING_FOR_TRANSACTIONS,
}

export const MINUTES_PER_YEAR = 24 * 365 * 60;

export const UP_LIMIT = 0.005;
export const DOWN_LIMIT = 0;

// for additional APR for ankrBNB in Ankr
export const ankrBNBContractAddress = '0xBb1Aa6e59E5163D8722a122cd66EBA614b59df0d';
export const aprDays = 7;
export const ankrBNBContractABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'day', type: 'uint256' }],
    name: 'averagePercentageRate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const MARKETS_COUNT_PER_PAGE = [25, 50, 75];
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
export const MIDAS_LOCALSTORAGE_KEYS = 'midas_localstorage_keys';
export const SHRINK_ASSETS = 10;
export const MIDAS_T_AND_C_ACCEPTED = 'MidasTandCAccepted';
export const SUPPLY_STEPS = (symbol: string) =>
  [
    { title: 'Approve', desc: 'Allow Midas to use your tokens', done: false },
    {
      title: 'Enable Collateral',
      desc: 'Allows supplied assets to be used as collateral',
      done: false,
    },
    {
      title: 'Mint Market Share',
      desc: `Mints tokens which represent your share in the ${symbol} market`,
      done: false,
    },
  ] as TxStep[];
export const BORROW_STEPS = (symbol: string) =>
  [{ title: 'Borrow', desc: `Borrows ${symbol} from the pool`, done: false }] as TxStep[];
export const WITHDRAW_STEPS = (symbol: string) =>
  [
    {
      title: 'Withdraw',
      desc: `Withdraws supplied liquidity of ${symbol} from the pool`,
      done: false,
    },
  ] as TxStep[];
export const REPAY_STEPS = (symbol: string) =>
  [
    { title: 'Approve', desc: 'Allow Midas to use your tokens', done: false },
    { title: 'Repay', desc: `Repays a borrow position of ${symbol} token`, done: false },
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
  LIQUIDITY,
  COLLATERAL,
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
  EXPANDER,
];
export const FEATURE_REQUESTS_URL = 'https://midascapital.canny.io/feature-requests';
export const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=';
export const DEFI_LLAMA_API = 'https://coins.llama.fi/prices/current/';
export const HIGH_RISK_RATIO = 0.8;
