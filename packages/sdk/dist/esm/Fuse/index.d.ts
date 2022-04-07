import { BigNumber, Contract } from "ethers";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { Artifact, Artifacts, cERC20Conf, ChainDeployment, InterestRateModel, InterestRateModelConf, InterestRateModelParams, OracleConf } from "./types";
import { SupportedChains } from "../network";
import { FusePoolDirectory } from "../../typechain/FusePoolDirectory";
import { FusePoolLens } from "../../typechain/FusePoolLens";
import { FusePoolLensSecondary } from "../../typechain/FusePoolLensSecondary";
import { FuseSafeLiquidator } from "../../typechain/FuseSafeLiquidator";
import { FuseFeeDistributor } from "../../typechain/FuseFeeDistributor";
declare type OracleConfig = {
    [contractName: string]: {
        artifact: Artifact;
        address: string;
    };
};
declare type IrmConfig = OracleConfig;
declare type ChainSpecificAddresses = {
    [tokenName: string]: string;
};
export declare class FuseBase {
    provider: JsonRpcProvider | Web3Provider;
    contracts: {
        FusePoolDirectory: FusePoolDirectory;
        FusePoolLens: FusePoolLens;
        FusePoolLensSecondary: FusePoolLensSecondary;
        FuseSafeLiquidator: FuseSafeLiquidator;
        FuseFeeDistributor: FuseFeeDistributor;
    };
    static SIMPLE_DEPLOY_ORACLES: string[];
    static COMPTROLLER_ERROR_CODES: string[];
    static CTOKEN_ERROR_CODES: string[];
    JumpRateModelConf: InterestRateModelConf;
    WhitePaperRateModelConf: InterestRateModelConf;
    availableOracles: Array<string>;
    chainId: SupportedChains;
    chainDeployment: ChainDeployment;
    oracles: OracleConfig;
    chainSpecificAddresses: ChainSpecificAddresses;
    artifacts: Artifacts;
    irms: IrmConfig;
    constructor(web3Provider: JsonRpcProvider | Web3Provider, chainId: SupportedChains, chainDeployment?: ChainDeployment);
    getUsdPriceBN(coingeckoId?: string, asBigNumber?: boolean): Promise<number | BigNumber>;
    deployPool(poolName: string, enforceWhitelist: boolean, closeFactor: BigNumber, liquidationIncentive: BigNumber, priceOracle: string, // Contract address
    priceOracleConf: OracleConf, options: any, // We might need to add sender as argument. Getting address from options will colide with the override arguments in ethers contract method calls. It doesnt take address.
    whitelist: string[]): Promise<[string, string, string]>;
    deployAsset(irmConf: InterestRateModelConf, cTokenConf: cERC20Conf, options: any): Promise<[string, string, string, TransactionReceipt]>;
    deployInterestRateModel(options: any, model?: string, conf?: InterestRateModelParams): Promise<string>;
    deployCToken(conf: cERC20Conf, options: any): Promise<[string, string, TransactionReceipt]>;
    deployCEther(conf: cERC20Conf, options: any, implementationAddress: string | null): Promise<[string, string, TransactionReceipt]>;
    deployCErc20(conf: cERC20Conf, options: any, implementationAddress: string | null): Promise<[string, string, TransactionReceipt]>;
    identifyPriceOracle(priceOracleAddress: string): Promise<string | null>;
    identifyInterestRateModel(interestRateModelAddress: string): Promise<InterestRateModel | null>;
    getInterestRateModel(assetAddress: string): Promise<any | undefined | null>;
    checkForCErc20PriceFeed(comptroller: Contract, conf: {
        underlying: string;
    }, options?: any): Promise<void>;
    getPriceOracle(oracleAddress: string): Promise<string | null>;
    checkCardinality(uniswapV3Pool: string): Promise<boolean>;
    primeUniswapV3Oracle(uniswapV3Pool: any, options: any): Promise<void>;
    identifyInterestRateModelName: (irmAddress: string) => string | null;
}
declare const FuseBaseWithModules: {
    new (...args: any[]): {
        getTotalValueLocked(whitelistedAdmin?: boolean): Promise<any>;
        provider: JsonRpcProvider | Web3Provider;
        contracts: {
            FusePoolDirectory: FusePoolDirectory;
            FusePoolLens: FusePoolLens;
            FusePoolLensSecondary: FusePoolLensSecondary;
            FuseSafeLiquidator: FuseSafeLiquidator;
            FuseFeeDistributor: FuseFeeDistributor;
        };
        JumpRateModelConf: InterestRateModelConf;
        WhitePaperRateModelConf: InterestRateModelConf;
        availableOracles: Array<string>;
        chainId: SupportedChains;
        chainDeployment: ChainDeployment;
        oracles: OracleConfig;
        chainSpecificAddresses: ChainSpecificAddresses;
        artifacts: Artifacts;
        irms: IrmConfig;
        getUsdPriceBN(coingeckoId?: string, asBigNumber?: boolean): Promise<number | BigNumber>;
        deployPool(poolName: string, enforceWhitelist: boolean, closeFactor: BigNumber, liquidationIncentive: BigNumber, priceOracle: string, priceOracleConf: OracleConf, options: any, whitelist: string[]): Promise<[string, string, string]>;
        deployAsset(irmConf: InterestRateModelConf, cTokenConf: cERC20Conf, options: any): Promise<[string, string, string, TransactionReceipt]>;
        deployInterestRateModel(options: any, model?: string | undefined, conf?: InterestRateModelParams | undefined): Promise<string>;
        deployCToken(conf: cERC20Conf, options: any): Promise<[string, string, TransactionReceipt]>;
        deployCEther(conf: cERC20Conf, options: any, implementationAddress: string | null): Promise<[string, string, TransactionReceipt]>;
        deployCErc20(conf: cERC20Conf, options: any, implementationAddress: string | null): Promise<[string, string, TransactionReceipt]>;
        identifyPriceOracle(priceOracleAddress: string): Promise<string | null>;
        identifyInterestRateModel(interestRateModelAddress: string): Promise<InterestRateModel | null>;
        getInterestRateModel(assetAddress: string): Promise<any | undefined | null>;
        checkForCErc20PriceFeed(comptroller: Contract, conf: {
            underlying: string;
        }, options?: any): Promise<void>;
        getPriceOracle(oracleAddress: string): Promise<string | null>;
        checkCardinality(uniswapV3Pool: string): Promise<boolean>;
        primeUniswapV3Oracle(uniswapV3Pool: any, options: any): Promise<void>;
        identifyInterestRateModelName: (irmAddress: string) => string | null;
    };
} & {
    new (...args: any[]): {
        deployRewardsDistributor(rewardTokenAddress: string, options: {
            from: string;
        }): Promise<RewardsDistributorDelegate>;
        addRewardsDistributorToPool(rewardsDistributorAddress: string, poolAddress: string, options: {
            from: string;
        }): any;
        fundRewardsDistributor(rewardsDistributorAddress: string, amount: import("ethers").BigNumberish, options: {
            from: string;
        }): Promise<any>;
        getRewardsDistributorSupplySpeed(rewardsDistributorAddress: string, cTokenAddress: string, options: {
            from: string;
        }): any;
        getRewardsDistributorBorrowSpeed(rewardsDistributorAddress: string, cTokenAddress: string, options: {
            from: string;
        }): any;
        updateRewardsDistributorSupplySpeed(rewardsDistributorAddress: string, cTokenAddress: string, amount: import("ethers").BigNumberish, options: {
            from: string;
        }): any;
        updateRewardsDistributorBorrowSpeed(rewardsDistributorAddress: string, cTokenAddress: string, amount: import("ethers").BigNumberish, options: {
            from: string;
        }): any;
        updateRewardsDistributorSpeeds(rewardsDistributorAddress: string, cTokenAddress: string[], amountSuppliers: import("ethers").BigNumberish[], amountBorrowers: import("ethers").BigNumberish[], options: {
            from: string;
        }): any;
        getRewardsDistributorMarketRewardsByPool(pool: string, options: {
            from: string;
        }): Promise<import("../modules/RewardsDistributor").MarketReward[]>;
        getRewardsDistributorMarketRewardsByPools(pools: string[], options: {
            from: string;
        }): Promise<{
            pool: string;
            marketRewards: import("../modules/RewardsDistributor").MarketReward[];
        }[]>;
        getRewardsDistributorClaimableRewards(account: string, options: {
            from: string;
        }): Promise<import("../modules/RewardsDistributor").ClaimableReward[]>;
        claimAllRewardsDistributorRewards(rewardsDistributorAddress: string, options: {
            from: string;
        }): any;
        "__#1@#getRewardsDistributor"(rewardsDistributorAddress: string, options: {
            from: string;
        }): RewardsDistributorDelegate;
        "__#1@#createMarketRewards"(allMarkets: string[], distributors: string[], rewardTokens: string[], supplySpeeds: BigNumber[][], borrowSpeeds: BigNumber[][]): import("../modules/RewardsDistributor").MarketReward[];
        provider: JsonRpcProvider | Web3Provider;
        contracts: {
            FusePoolDirectory: FusePoolDirectory;
            FusePoolLens: FusePoolLens;
            FusePoolLensSecondary: FusePoolLensSecondary;
            FuseSafeLiquidator: FuseSafeLiquidator;
            FuseFeeDistributor: FuseFeeDistributor;
        };
        JumpRateModelConf: InterestRateModelConf;
        WhitePaperRateModelConf: InterestRateModelConf;
        availableOracles: Array<string>;
        chainId: SupportedChains;
        chainDeployment: ChainDeployment;
        oracles: OracleConfig;
        chainSpecificAddresses: ChainSpecificAddresses;
        artifacts: Artifacts;
        irms: IrmConfig;
        getUsdPriceBN(coingeckoId?: string, asBigNumber?: boolean): Promise<number | BigNumber>;
        deployPool(poolName: string, enforceWhitelist: boolean, closeFactor: BigNumber, liquidationIncentive: BigNumber, priceOracle: string, priceOracleConf: OracleConf, options: any, whitelist: string[]): Promise<[string, string, string]>;
        deployAsset(irmConf: InterestRateModelConf, cTokenConf: cERC20Conf, options: any): Promise<[string, string, string, TransactionReceipt]>;
        deployInterestRateModel(options: any, model?: string | undefined, conf?: InterestRateModelParams | undefined): Promise<string>;
        deployCToken(conf: cERC20Conf, options: any): Promise<[string, string, TransactionReceipt]>;
        deployCEther(conf: cERC20Conf, options: any, implementationAddress: string | null): Promise<[string, string, TransactionReceipt]>;
        deployCErc20(conf: cERC20Conf, options: any, implementationAddress: string | null): Promise<[string, string, TransactionReceipt]>;
        identifyPriceOracle(priceOracleAddress: string): Promise<string | null>;
        identifyInterestRateModel(interestRateModelAddress: string): Promise<InterestRateModel | null>;
        getInterestRateModel(assetAddress: string): Promise<any | undefined | null>;
        checkForCErc20PriceFeed(comptroller: Contract, conf: {
            underlying: string;
        }, options?: any): Promise<void>;
        getPriceOracle(oracleAddress: string): Promise<string | null>;
        checkCardinality(uniswapV3Pool: string): Promise<boolean>;
        primeUniswapV3Oracle(uniswapV3Pool: any, options: any): Promise<void>;
        identifyInterestRateModelName: (irmAddress: string) => string | null;
    };
} & {
    new (...args: any[]): {
        fetchGasForCall(amount: BigNumber, address: string): Promise<{
            gasWEI: BigNumber;
            gasPrice: BigNumber;
            estimatedGas: BigNumber;
        }>;
        supply(cTokenAddress: string, underlyingTokenAddress: string, comptrollerAddress: string, isNativeToken: boolean, enableAsCollateral: boolean, amount: BigNumber, options: {
            from: string;
        }): Promise<{
            errorCode: number;
            tx?: undefined;
        } | {
            tx: import("ethers").ContractTransaction;
            errorCode: null;
        }>;
        repay(cTokenAddress: string, underlyingTokenAddress: string, isNativeToken: boolean, isRepayingMax: boolean, amount: BigNumber, options: {
            from: string;
        }): Promise<{
            errorCode: number;
            tx?: undefined;
        } | {
            tx: import("ethers").ContractTransaction;
            errorCode: null;
        }>;
        borrow(cTokenAddress: string, amount: BigNumber, options: {
            from: string;
        }): Promise<{
            errorCode: number;
            tx?: undefined;
        } | {
            tx: import("ethers").ContractTransaction;
            errorCode: null;
        }>;
        withdraw(cTokenAddress: string, amount: BigNumber, options: {
            from: string;
        }): Promise<{
            errorCode: number;
            tx?: undefined;
        } | {
            tx: import("ethers").ContractTransaction;
            errorCode: null;
        }>;
        provider: JsonRpcProvider | Web3Provider;
        contracts: {
            FusePoolDirectory: FusePoolDirectory;
            FusePoolLens: FusePoolLens;
            FusePoolLensSecondary: FusePoolLensSecondary;
            FuseSafeLiquidator: FuseSafeLiquidator;
            FuseFeeDistributor: FuseFeeDistributor;
        };
        JumpRateModelConf: InterestRateModelConf;
        WhitePaperRateModelConf: InterestRateModelConf;
        availableOracles: Array<string>;
        chainId: SupportedChains;
        chainDeployment: ChainDeployment;
        oracles: OracleConfig;
        chainSpecificAddresses: ChainSpecificAddresses;
        artifacts: Artifacts;
        irms: IrmConfig;
        getUsdPriceBN(coingeckoId?: string, asBigNumber?: boolean): Promise<number | BigNumber>;
        deployPool(poolName: string, enforceWhitelist: boolean, closeFactor: BigNumber, liquidationIncentive: BigNumber, priceOracle: string, priceOracleConf: OracleConf, options: any, whitelist: string[]): Promise<[string, string, string]>;
        deployAsset(irmConf: InterestRateModelConf, cTokenConf: cERC20Conf, options: any): Promise<[string, string, string, TransactionReceipt]>;
        deployInterestRateModel(options: any, model?: string | undefined, conf?: InterestRateModelParams | undefined): Promise<string>;
        deployCToken(conf: cERC20Conf, options: any): Promise<[string, string, TransactionReceipt]>;
        deployCEther(conf: cERC20Conf, options: any, implementationAddress: string | null): Promise<[string, string, TransactionReceipt]>;
        deployCErc20(conf: cERC20Conf, options: any, implementationAddress: string | null): Promise<[string, string, TransactionReceipt]>;
        identifyPriceOracle(priceOracleAddress: string): Promise<string | null>;
        identifyInterestRateModel(interestRateModelAddress: string): Promise<InterestRateModel | null>;
        getInterestRateModel(assetAddress: string): Promise<any | undefined | null>;
        checkForCErc20PriceFeed(comptroller: Contract, conf: {
            underlying: string;
        }, options?: any): Promise<void>;
        getPriceOracle(oracleAddress: string): Promise<string | null>;
        checkCardinality(uniswapV3Pool: string): Promise<boolean>;
        primeUniswapV3Oracle(uniswapV3Pool: any, options: any): Promise<void>;
        identifyInterestRateModelName: (irmAddress: string) => string | null;
    };
} & {
    new (...args: any[]): {
        chainLiquidationConfig: import("..").ChainLiquidationConfig;
        getPotentialLiquidations(supportedComptrollers?: string[], maxHealthFactor?: BigNumber, configOverrides?: import("..").ChainLiquidationConfig | undefined): Promise<import("../modules/liquidation/utils").LiquidatablePool[]>;
        estimateProfit(liquidation: any): Promise<void>;
        liquidatePositions(positions: import("../modules/liquidation/utils").LiquidatablePool[]): Promise<void>;
        getPositionRation(position: any): Promise<void>;
        provider: JsonRpcProvider | Web3Provider;
        contracts: {
            FusePoolDirectory: FusePoolDirectory;
            FusePoolLens: FusePoolLens;
            FusePoolLensSecondary: FusePoolLensSecondary;
            FuseSafeLiquidator: FuseSafeLiquidator;
            FuseFeeDistributor: FuseFeeDistributor;
        };
        JumpRateModelConf: InterestRateModelConf;
        WhitePaperRateModelConf: InterestRateModelConf;
        availableOracles: Array<string>;
        chainId: SupportedChains;
        chainDeployment: ChainDeployment;
        oracles: OracleConfig;
        chainSpecificAddresses: ChainSpecificAddresses;
        artifacts: Artifacts;
        irms: IrmConfig;
        getUsdPriceBN(coingeckoId?: string, asBigNumber?: boolean): Promise<number | BigNumber>;
        deployPool(poolName: string, enforceWhitelist: boolean, closeFactor: BigNumber, liquidationIncentive: BigNumber, priceOracle: string, priceOracleConf: OracleConf, options: any, whitelist: string[]): Promise<[string, string, string]>;
        deployAsset(irmConf: InterestRateModelConf, cTokenConf: cERC20Conf, options: any): Promise<[string, string, string, TransactionReceipt]>;
        deployInterestRateModel(options: any, model?: string | undefined, conf?: InterestRateModelParams | undefined): Promise<string>;
        deployCToken(conf: cERC20Conf, options: any): Promise<[string, string, TransactionReceipt]>;
        deployCEther(conf: cERC20Conf, options: any, implementationAddress: string | null): Promise<[string, string, TransactionReceipt]>;
        deployCErc20(conf: cERC20Conf, options: any, implementationAddress: string | null): Promise<[string, string, TransactionReceipt]>;
        identifyPriceOracle(priceOracleAddress: string): Promise<string | null>;
        identifyInterestRateModel(interestRateModelAddress: string): Promise<InterestRateModel | null>;
        getInterestRateModel(assetAddress: string): Promise<any | undefined | null>;
        checkForCErc20PriceFeed(comptroller: Contract, conf: {
            underlying: string;
        }, options?: any): Promise<void>;
        getPriceOracle(oracleAddress: string): Promise<string | null>;
        checkCardinality(uniswapV3Pool: string): Promise<boolean>;
        primeUniswapV3Oracle(uniswapV3Pool: any, options: any): Promise<void>;
        identifyInterestRateModelName: (irmAddress: string) => string | null;
    };
} & {
    new (...args: any[]): {
        fetchFusePoolData(poolId: string, address?: string | undefined, coingeckoId?: string | undefined): Promise<import("./types").FusePoolData>;
        fetchPoolsManual({ verification, coingeckoId, options, }: {
            verification: boolean;
            coingeckoId: string;
            options: {
                from: string;
            };
        }): Promise<import("./types").FusePoolData[] | undefined>;
        fetchPools({ filter, coingeckoId, options, }: {
            filter: string | null;
            coingeckoId: string;
            options: {
                from: string;
            };
        }): Promise<import("./types").FusePoolData[] | undefined>;
        provider: JsonRpcProvider | Web3Provider;
        contracts: {
            FusePoolDirectory: FusePoolDirectory;
            FusePoolLens: FusePoolLens;
            FusePoolLensSecondary: FusePoolLensSecondary;
            FuseSafeLiquidator: FuseSafeLiquidator;
            FuseFeeDistributor: FuseFeeDistributor;
        };
        JumpRateModelConf: InterestRateModelConf;
        WhitePaperRateModelConf: InterestRateModelConf;
        availableOracles: Array<string>;
        chainId: SupportedChains;
        chainDeployment: ChainDeployment;
        oracles: OracleConfig;
        chainSpecificAddresses: ChainSpecificAddresses;
        artifacts: Artifacts;
        irms: IrmConfig;
        getUsdPriceBN(coingeckoId?: string, asBigNumber?: boolean): Promise<number | BigNumber>;
        deployPool(poolName: string, enforceWhitelist: boolean, closeFactor: BigNumber, liquidationIncentive: BigNumber, priceOracle: string, priceOracleConf: OracleConf, options: any, whitelist: string[]): Promise<[string, string, string]>;
        deployAsset(irmConf: InterestRateModelConf, cTokenConf: cERC20Conf, options: any): Promise<[string, string, string, TransactionReceipt]>;
        deployInterestRateModel(options: any, model?: string | undefined, conf?: InterestRateModelParams | undefined): Promise<string>;
        deployCToken(conf: cERC20Conf, options: any): Promise<[string, string, TransactionReceipt]>;
        deployCEther(conf: cERC20Conf, options: any, implementationAddress: string | null): Promise<[string, string, TransactionReceipt]>;
        deployCErc20(conf: cERC20Conf, options: any, implementationAddress: string | null): Promise<[string, string, TransactionReceipt]>;
        identifyPriceOracle(priceOracleAddress: string): Promise<string | null>;
        identifyInterestRateModel(interestRateModelAddress: string): Promise<InterestRateModel | null>;
        getInterestRateModel(assetAddress: string): Promise<any | undefined | null>;
        checkForCErc20PriceFeed(comptroller: Contract, conf: {
            underlying: string;
        }, options?: any): Promise<void>;
        getPriceOracle(oracleAddress: string): Promise<string | null>;
        checkCardinality(uniswapV3Pool: string): Promise<boolean>;
        primeUniswapV3Oracle(uniswapV3Pool: any, options: any): Promise<void>;
        identifyInterestRateModelName: (irmAddress: string) => string | null;
    };
} & typeof FuseBase;
export default class Fuse extends FuseBaseWithModules {
}
export {};
