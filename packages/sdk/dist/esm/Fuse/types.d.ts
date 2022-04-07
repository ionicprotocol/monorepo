import { BigNumber, BigNumberish, providers } from "ethers";
import JumpRateModel from "./irm/JumpRateModel";
import DAIInterestRateModelV2 from "./irm/DAIInterestRateModelV2";
import WhitePaperInterestRateModel from "./irm/WhitePaperInterestRateModel";
import { FuseBase } from ".";
export declare type GConstructor<T = {}> = new (...args: any[]) => T;
export declare type FuseBaseConstructor = GConstructor<FuseBase>;
export declare type MinifiedContracts = {
    [key: string]: {
        abi?: any;
        bin?: any;
    };
};
export declare type MinifiedCompoundContracts = {
    [key: string]: {
        abi?: any;
        bytecode?: any;
    };
};
export declare type MinifiedOraclesContracts = MinifiedCompoundContracts;
export interface InterestRateModel {
    init(interestRateModelAddress: string, assetAddress: string, provider: providers.Web3Provider | providers.JsonRpcProvider): Promise<void>;
    _init(interestRateModelAddress: string, reserveFactorMantissa: BigNumberish, adminFeeMantissa: BigNumberish, fuseFeeMantissa: BigNumberish, provider: providers.Web3Provider | providers.JsonRpcProvider): Promise<void>;
    __init(baseRatePerBlock: BigNumberish, multiplierPerBlock: BigNumberish, jumpMultiplierPerBlock: BigNumberish, kink: BigNumberish, reserveFactorMantissa: BigNumberish, adminFeeMantissa: BigNumberish, fuseFeeMantissa: BigNumberish): Promise<void>;
    getBorrowRate(utilizationRate: BigNumber): BigNumber;
    getSupplyRate(utilizationRate: BigNumber): BigNumber;
}
export declare type Artifact = {
    abi: any;
    bytecode: {
        object: string;
        sourceMap: string;
        linkReferences: any;
    };
    deployedBytecode: {
        object: string;
        sourceMap: string;
        linkReferences: any;
    };
};
export declare type Artifacts = {
    [contractName: string]: Artifact;
};
export declare type ChainDeployment = {
    [contractName: string]: {
        abi: any;
        address: string;
    };
};
export declare type InterestRateModelType = JumpRateModel | DAIInterestRateModelV2 | WhitePaperInterestRateModel;
export declare type cERC20Conf = {
    delegateContractName?: any;
    underlying: string;
    comptroller: string;
    fuseFeeDistributor: string;
    interestRateModel: string;
    initialExchangeRateMantissa?: BigNumber;
    name: string;
    symbol: string;
    decimals: number;
    admin: string;
    collateralFactor: number;
    reserveFactor: number;
    adminFee: number;
    bypassPriceFeedCheck: boolean;
};
export declare type OracleConf = {
    anchorPeriod?: any;
    tokenConfigs?: any;
    canAdminOverwrite?: any;
    isPublic?: any;
    maxSecondsBeforePriceIsStale?: any;
    chainlinkPriceOracle?: any;
    secondaryPriceOracle?: any;
    reporter?: any;
    anchorMantissa?: any;
    isSecure?: any;
    useRootOracle?: any;
    underlyings?: any;
    sushiswap?: any;
    oracles?: any;
    admin?: any;
    rootOracle?: any;
    uniswapV2Factory?: any;
    baseToken?: any;
    uniswapV3Factory?: any;
    feeTier?: any;
    defaultOracle?: any;
};
export declare type InterestRateModelParams = {
    blocksPerYear?: BigNumber;
    baseRatePerYear?: string;
    multiplierPerYear?: string;
    jumpMultiplierPerYear?: string;
    kink?: string;
};
export declare type InterestRateModelConf = {
    interestRateModel?: string;
    interestRateModelParams?: InterestRateModelParams;
};
export interface FuseAsset {
    cToken: string;
    borrowBalance: BigNumber;
    supplyBalance: BigNumber;
    liquidity: BigNumber;
    membership: boolean;
    underlyingName: string;
    underlyingSymbol: string;
    underlyingToken: string;
    underlyingDecimals: BigNumber;
    underlyingPrice: BigNumber;
    underlyingBalance: BigNumber;
    collateralFactor: BigNumber;
    reserveFactor: BigNumber;
    adminFee: BigNumber;
    fuseFee: BigNumber;
    borrowRatePerBlock: BigNumber;
    supplyRatePerBlock: BigNumber;
    totalBorrow: BigNumber;
    totalSupply: BigNumber;
}
export interface USDPricedFuseAsset extends FuseAsset {
    supplyBalanceUSD: number;
    borrowBalanceUSD: number;
    totalSupplyUSD: number;
    totalBorrowUSD: number;
    liquidityUSD: number;
    isPaused: boolean;
    isSupplyPaused: boolean;
}
export interface FusePoolData {
    id: number;
    assets: USDPricedFuseAsset[];
    creator: string;
    comptroller: string;
    name: string;
    totalLiquidityUSD: number;
    totalSuppliedUSD: number;
    totalBorrowedUSD: number;
    totalSupplyBalanceUSD: number;
    totalBorrowBalanceUSD: number;
    blockPosted: BigNumber;
    timestampPosted: BigNumber;
    underlyingTokens: string[];
    underlyingSymbols: string[];
    whitelistedAdmin: boolean;
}
export interface FusePool {
    name: string;
    creator: string;
    comptroller: string;
    blockPosted: number;
    timestampPosted: number;
}
