import { BigNumber, BigNumberish } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { InterestRateModel } from "../types";
export default class WhitePaperInterestRateModel implements InterestRateModel {
    static RUNTIME_BYTECODE_HASH: string;
    initialized: boolean | undefined;
    baseRatePerBlock: BigNumber | undefined;
    multiplierPerBlock: BigNumber | undefined;
    reserveFactorMantissa: BigNumber | undefined;
    init(interestRateModelAddress: string, assetAddress: string, provider: any): Promise<void>;
    _init(interestRateModelAddress: string, reserveFactorMantissa: BigNumberish, adminFeeMantissa: BigNumberish, fuseFeeMantissa: BigNumberish, provider: Web3Provider): Promise<void>;
    __init(baseRatePerBlock: BigNumberish, multiplierPerBlock: BigNumberish, reserveFactorMantissa: BigNumberish, adminFeeMantissa: BigNumberish, fuseFeeMantissa: BigNumberish): Promise<void>;
    getBorrowRate(utilizationRate: BigNumber): BigNumber;
    getSupplyRate(utilizationRate: BigNumber): BigNumber;
}
