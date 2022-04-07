import { SupportedChains } from "../network";
export declare const SIMPLE_DEPLOY_ORACLES: Array<string>;
export declare const ORACLES: Array<string>;
export declare const COMPTROLLER_ERROR_CODES: Array<string>;
export declare const CTOKEN_ERROR_CODES: Array<string>;
export declare const JUMP_RATE_MODEL_CONF: (chainId: SupportedChains) => {
    interestRateModel: string;
    interestRateModelParams: {
        blocksPerYear: any;
        baseRatePerYear: string;
        multiplierPerYear: string;
        jumpMultiplierPerYear: string;
        kink: string;
    };
};
export declare const WHITE_PAPER_RATE_MODEL_CONF: (chainId: SupportedChains) => {
    interestRateModel: string;
    interestRateModelParams: {
        blocksPerYear: any;
        baseRatePerYear: string;
        multiplierPerYear: string;
    };
};
