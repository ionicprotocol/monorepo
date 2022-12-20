import { BoxProps, FlexProps } from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/types';
import { BigNumber } from 'ethers';
import { ReactNode } from 'react';

import { PoolData, TokensDataMap } from '@ui/types/TokensDataMap';

export type FusePageLayoutProps = {
  children?: ReactNode;
};

export type ExtendedBoxProps = BoxProps & { glow?: boolean };

export type RefetchMovingStatProps = Omit<CaptionedStatProps, 'stat'> & {
  queryKey: string;
  /** In milliseconds like: 1000, 500, 20, 10, 221 */
  interval: number;
  fetch: () => Promise<string>;
  loadingPlaceholder: string;
};

export type MainAxisAlignmentStrings =
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'flex-start'
  | 'center'
  | 'flex-end';

export type MainAxisAlignment =
  | MainAxisAlignmentStrings
  | { md: MainAxisAlignmentStrings; base: MainAxisAlignmentStrings };

export type CrossAxisAlignmentStrings = 'flex-start' | 'center' | 'flex-end' | 'stretch';

export type CrossAxisAlignment =
  | CrossAxisAlignmentStrings
  | {
      md: CrossAxisAlignmentStrings;
      base: CrossAxisAlignmentStrings;
    };

export type CenterProps = {
  children: React.ReactNode;
  expand?: boolean;
} & FlexProps;

export type ColumnProps = {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  children?: React.ReactNode;
  expand?: boolean;
} & FlexProps;

export type RowProps = {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  children?: React.ReactNode;
  expand?: boolean;
} & FlexProps;

export type AssetsMapWithTokenDataReturn = {
  assetsArrayWithTokenData: NativePricedFuseAssetWithTokenData[][] | null; // Fuse Asset with additional info about the token appended on
  tokensDataMap: TokensDataHash; // hashmap of unique assets and their token data
};

export type CTokenDataForRewards = Pick<
  NativePricedFuseAsset,
  'underlyingToken' | 'cToken' | 'totalSupply' | 'underlyingPrice'
>;

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

// interfaces

export interface NativePricedFuseAssetWithTokenData extends NativePricedFuseAsset {
  tokenData: TokenData;
}

export interface TokenData {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  color: string;
  overlayTextColor: string;
  logoURL: string;
  extraData: ExtraData;
}

export interface ExtraData {
  partnerURL: string;
  hasAPY: boolean;
  shortName: string;
  apy: number;
}

export interface AssetHash {
  [address: string]: NativePricedFuseAsset;
}
export interface TokensDataHash {
  [address: string]: TokenData;
}

export interface CaptionedStatProps {
  crossAxisAlignment: CrossAxisAlignment;
  stat: string;
  caption: string;
  spacing?: string | number;
  captionFirst?: boolean;
  captionColor?: string;
  tooltip?: string;
}

export interface CTokensDataForRewardsMap {
  [cTokenAddr: string]: CTokenDataForRewards;
}

export interface AddFlywheelProps {
  comptrollerAddress: string;
  onSuccess?: () => void;
}

export interface AddFlywheelModalProps extends AddFlywheelProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CreateFlywheelProps {
  comptrollerAddress: string;
  onSuccess?: () => void;
}

export interface CreateFlywheelModalProps extends CreateFlywheelProps {
  isOpen: boolean;
  onClose: () => void;
}
export interface Flywheel {
  address: string;
  booster: string;
  owner: string;
  rewards: string;
  rewardToken: string;
  markets: string[];
}

export interface CTokenRewardsDistributorIncentives {
  rewardsDistributorAddress: string;
  rewardToken: string;
  borrowSpeed: number;
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
  rewardsDistributorCtokens: RewardsDistributorCTokensMap;
  rewardTokensData: TokensDataMap;
}

export interface CTokensUnderlyingMap {
  [cTokenAddr: string]: string;
}

export interface CTokenRewardsDistributorIncentivesWithRates
  extends CTokenRewardsDistributorIncentives {
  supplyAPY: number;
  borrowAPY: number;
  supplyAPR: number;
  borrowAPR: number;
}

export interface CTokenRewardsDistributorIncentivesWithRatesMap {
  [cTokenAddress: string]: CTokenRewardsDistributorIncentivesWithRates[];
}

export interface RewardsDataForMantissa {
  cTokenAddress: string;
  rewardSpeed: number;
  rewardEthPrice: number;
  underlyingTotalSupply: BigNumber;
  underlyingEthPrice: number;
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
  rewardToken: string;
  admin: string;
}

export interface CoinGeckoResponse {
  decimals: number;
  name: string;
  symbol: string;
  image: {
    large: string;
    small: string;
    thumb: string;
  };
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
  timeDelta?: number;
  externalAPY?: number;
  updatedAt?: string;
  error?: string;
};

export type PoolsPerChainStatus = {
  [chainId: string]: {
    isLoading: boolean;
    error: Error | undefined;
    data?: PoolData[] | null | undefined;
  };
};

export type Err = Error & { code?: string; reason?: string };

export type IRMToCurveData = {
  rates: UtilizationChartData[];
};

export type UtilizationChartData = { utilization: number; depositRate: number; borrowRate: number };
