import { Artifacts, ChainDeployment } from "./Fuse/types";
import { BigNumber } from "ethers";
export declare enum SupportedChains {
    bsc = 56,
    chapel = 97,
    ganache = 1337,
    aurora = 1313161555,
    evmos = 9001,
    evmos_testnet = 9000,
    harmony = 1666600000,
    moonbeam = 1284,
    moonbase_alpha = 1287
}
export declare const chainSpecificParams: {
    1337: {
        blocksPerYear: BigNumber;
    };
    97: {
        blocksPerYear: BigNumber;
    };
    56: {
        blocksPerYear: BigNumber;
    };
    9000: {
        blocksPerYear: BigNumber;
    };
    1284: {
        blocksPerYear: BigNumber;
    };
    1287: {
        blocksPerYear: BigNumber;
    };
};
export declare const chainSpecificAddresses: {
    1337: {
        DAI_POT: string;
        DAI_JUG: string;
        USDC: string;
        W_TOKEN: string;
        W_TOKEN_USD_CHAINLINK_PRICE_FEED: string;
        UNISWAP_V2_ROUTER: string;
        UNISWAP_V2_FACTORY: string;
        PAIR_INIT_HASH: string;
    };
    97: {
        DAI_POT: string;
        DAI_JUG: string;
        USDC: string;
        W_TOKEN: string;
        W_TOKEN_USD_CHAINLINK_PRICE_FEED: string;
        UNISWAP_V2_ROUTER: string;
        UNISWAP_V2_FACTORY: string;
        PAIR_INIT_HASH: string;
    };
    56: {
        DAI_POT: string;
        DAI_JUG: string;
        USDC: string;
        W_TOKEN: string;
        W_TOKEN_USD_CHAINLINK_PRICE_FEED: string;
        UNISWAP_V2_ROUTER: string;
        UNISWAP_V2_FACTORY: string;
        PAIR_INIT_HASH: string;
    };
    9000: {
        DAI_POT: string;
        DAI_JUG: string;
        USDC: string;
        W_TOKEN: string;
        W_TOKEN_USD_CHAINLINK_PRICE_FEED: string;
        UNISWAP_V2_ROUTER: string;
        UNISWAP_V2_FACTORY: string;
        PAIR_INIT_HASH: string;
    };
    1284: {
        DAI_POT: string;
        DAI_JUG: string;
        USDC: string;
        W_TOKEN: string;
        W_TOKEN_USD_CHAINLINK_PRICE_FEED: string;
        UNISWAP_V2_ROUTER: string;
        UNISWAP_V2_FACTORY: string;
        PAIR_INIT_HASH: string;
    };
    1287: {
        DAI_POT: string;
        DAI_JUG: string;
        USDC: string;
        W_TOKEN: string;
        W_TOKEN_USD_CHAINLINK_PRICE_FEED: string;
        UNISWAP_V2_ROUTER: string;
        UNISWAP_V2_FACTORY: string;
        PAIR_INIT_HASH: string;
    };
};
export declare const chainOracles: {
    1337: ("MasterPriceOracle" | "SimplePriceOracle")[];
    97: ("MasterPriceOracle" | "ChainlinkPriceOracleV2" | "UniswapTwapPriceOracleV2")[];
    56: ("MasterPriceOracle" | "SimplePriceOracle" | "ChainlinkPriceOracleV2" | "UniswapTwapPriceOracleV2")[];
    9000: "MasterPriceOracle"[];
    1284: "MasterPriceOracle"[];
    1287: "MasterPriceOracle"[];
};
export declare const oracleConfig: (deployments: ChainDeployment, artifacts: Artifacts, availableOracles: Array<string>) => {
    [k: string]: {
        artifact: import("./Fuse/types").Artifact;
        address: string;
    };
};
export declare const irmConfig: (deployments: ChainDeployment, artifacts: Artifacts) => {
    JumpRateModel: {
        artifact: import("./Fuse/types").Artifact;
        address: string;
    };
    WhitePaperInterestRateModel: {
        artifact: import("./Fuse/types").Artifact;
        address: string;
    };
};
