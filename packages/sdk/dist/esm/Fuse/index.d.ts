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
declare const FuseBaseWithModules: any;
export default class Fuse extends FuseBaseWithModules {
}
export {};
