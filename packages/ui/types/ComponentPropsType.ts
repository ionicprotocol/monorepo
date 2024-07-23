import type { FlywheelClaimableRewards } from '@ionicprotocol/sdk/dist/cjs/src/modules/Flywheel';
import type {
  NativePricedIonicAsset,
  NewPosition,
  OpenPosition,
  VaultData
} from '@ionicprotocol/types';
import type { QueryObserverResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Address } from 'viem';

import type { PoolData, TokensDataMap } from '@ui/types/TokensDataMap';

export type FusePageLayoutProps = {
  children?: ReactNode;
};

export type RefetchMovingStatProps = Omit<CaptionedStatProps, 'stat'> & {
  fetch: () => Promise<string>;
  /** In milliseconds like: 1000, 500, 20, 10, 221 */
  interval: number;
  loadingPlaceholder: string;
  queryKey: string;
};

export type MainAxisAlignmentStrings =
  | 'center'
  | 'flex-end'
  | 'flex-start'
  | 'space-around'
  | 'space-between'
  | 'space-evenly';

export type MainAxisAlignment =
  | MainAxisAlignmentStrings
  | { base: MainAxisAlignmentStrings; md: MainAxisAlignmentStrings };

export type CrossAxisAlignmentStrings =
  | 'center'
  | 'flex-end'
  | 'flex-start'
  | 'stretch';

export type CrossAxisAlignment =
  | CrossAxisAlignmentStrings
  | {
      base: CrossAxisAlignmentStrings;
      md: CrossAxisAlignmentStrings;
    };

export type AssetsMapWithTokenDataReturn = {
  assetsArrayWithTokenData: NativePricedIonicAssetWithTokenData[][] | null; // Fuse Asset with additional info about the token appended on
  tokensDataMap: TokensDataHash; // hashmap of unique assets and their token data
};

export type CTokenDataForRewards = Pick<
  NativePricedIonicAsset,
  'cToken' | 'totalSupply' | 'underlyingPrice' | 'underlyingToken'
>;

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

// interfaces

export interface NativePricedIonicAssetWithTokenData
  extends NativePricedIonicAsset {
  tokenData: TokenData;
}

export interface TokenData {
  address: Address;
  color: string;
  decimals: number;
  extraData: ExtraData;
  logoURL: string;
  name: string;
  originalSymbol?: string;
  overlayTextColor: string;
  symbol: string;
}

export interface ExtraData {
  apy: number;
  hasAPY: boolean;
  partnerURL: string;
  shortName: string;
}

export interface AssetHash {
  [address: string]: NativePricedIonicAsset;
}
export interface TokensDataHash {
  [address: string]: TokenData;
}

export interface CaptionedStatProps {
  caption: string;
  captionColor?: string;
  captionFirst?: boolean;
  crossAxisAlignment: CrossAxisAlignment;
  secondStat?: string;
  spacing?: number | string;
  stat: string;
  tooltip?: string;
}

export interface CTokensDataForRewardsMap {
  [cTokenAddr: Address]: CTokenDataForRewards;
}

export interface AddFlywheelProps {
  comptrollerAddress: Address;
  onSuccess?: () => void;
}

export interface AddFlywheelModalProps extends AddFlywheelProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CreateFlywheelProps {
  comptrollerAddress: Address;
  onSuccess?: () => void;
}

export interface CreateFlywheelModalProps extends CreateFlywheelProps {
  isOpen: boolean;
  onClose: () => void;
}
export interface Flywheel {
  address: Address;
  booster: Address;
  markets: Address[];
  owner: Address;
  rewardToken: Address;
  rewards: Address;
}

export interface CTokenRewardsDistributorIncentives {
  borrowSpeed: number;
  rewardToken: Address;
  rewardsDistributorAddress: Address;
  supplySpeed: number;
}

export interface CTokenIncentivesMap {
  [cTokenAddress: string]: CTokenRewardsDistributorIncentives[];
}

// Maps a rewardsDistributor to an array of all its cToken addresses
export interface RewardsDistributorCTokensMap {
  [rewardsDistributorAddress: string]: string[];
}

export interface IncentivesData {
  hasIncentives: boolean;
  incentives: CTokenRewardsDistributorIncentivesWithRatesMap;
  rewardTokensData: TokensDataMap;
  rewardsDistributorCtokens: RewardsDistributorCTokensMap;
}

export interface CTokensUnderlyingMap {
  [cTokenAddr: string]: string;
}

export interface CTokenRewardsDistributorIncentivesWithRates
  extends CTokenRewardsDistributorIncentives {
  borrowAPR: number;
  borrowAPY: number;
  supplyAPR: number;
  supplyAPY: number;
}

export interface CTokenRewardsDistributorIncentivesWithRatesMap {
  [cTokenAddress: string]: CTokenRewardsDistributorIncentivesWithRates[];
}

export interface RewardsDataForMantissa {
  cTokenAddress: string;
  rewardEthPrice: number;
  rewardSpeed: number;
  underlyingEthPrice: number;
  underlyingTotalSupply: bigint;
}

export interface TokenPricesMap {
  [x: string]: {
    ethPrice: number;
    usdPrice: number;
  };
}

export interface TokenPrices {
  tokenPrices: TokenPricesMap;
  usdPrice: number;
}

export interface RewardsDistributor {
  address: string;
  admin: string;
  rewardToken: string;
}

export interface CoinGeckoResponse {
  decimals: number;
  image: {
    large: string;
    small: string;
    thumb: string;
  };
  name: string;
  symbol: string;
}

export interface TokenDataResponse {
  address: string;
  color: string;
  decimals: number;
  logoURL?: string;
  name: string;
  overlayTextColor: string;
  symbol: string;
}

export type APYResponse = {
  apy?: number;
  averageAPY?: number;
  error?: string;
  externalAPY?: number;
  timeDelta?: number;
  updatedAt?: string;
};

export type PoolsPerChainStatus = {
  [chainId: string]: {
    data?: PoolData[] | null | undefined;
    error: Error | undefined;
    isLoading: boolean;
  };
};

export type VaultsPerChainStatus = {
  [chainId: string]: {
    data?: VaultData[] | null | undefined;
    error: Error | undefined;
    isLoading: boolean;
  };
};

export type PositionsPerChainStatus = {
  [chainId: string]: {
    data?:
      | { newPositions: NewPosition[]; openPositions: OpenPosition[] }
      | null
      | undefined;
    error: Error | undefined;
    isLoading: boolean;
  };
};

export type AllRewardsPerChainStatus = {
  [chainId: string]:
    | Pick<FlywheelClaimableRewards, 'amount' | 'rewardToken'>[]
    | null
    | undefined;
};

export type RewardsPerChainProps = {
  [chainId: string]: {
    data?: FlywheelClaimableRewards[] | null | undefined;
    error: Error | undefined;
    isLoading: boolean;
    refetch: () => Promise<
      QueryObserverResult<
        FlywheelClaimableRewards[] | null | undefined,
        unknown
      >
    >;
  };
};

export type Err = Error & { code?: string; reason?: string };

export type IRMToCurveData = {
  rates: UtilizationChartData[];
};

export type UtilizationChartData = {
  borrowRate: number;
  depositRate: number;
  utilization: number;
};

export type TxStep = {
  desc: string;
  done: boolean;
  title: string;
  txHash?: string;
};
