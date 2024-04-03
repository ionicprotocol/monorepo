import { SupportedChainsArray } from '@ionicprotocol/types';

import type { TxStep } from '@ui/types/ComponentPropsType';

export const SUPPORTED_NETWORKS_REGEX = new RegExp(
  SupportedChainsArray.join('|')
);
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
  MAX: 90,
  MIN: 5
};

export const LIQUIDATION_INCENTIVE = {
  DEFAULT: 8,
  MAX: 50,
  MIN: 0
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
