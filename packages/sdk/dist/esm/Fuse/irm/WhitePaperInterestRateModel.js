var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BigNumber, constants, Contract, utils } from "ethers";
import WhitePaperInterestRateModelArtifact from "../../../out/WhitePaperInterestRateModel.sol/WhitePaperInterestRateModel.json";
import CTokenInterfacesArtifact from "../../../out/CTokenInterfaces.sol/CTokenInterface.json";
export default class WhitePaperInterestRateModel {
    init(interestRateModelAddress, assetAddress, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const whitePaperModelContract = new Contract(interestRateModelAddress, WhitePaperInterestRateModelArtifact.abi, provider);
            this.baseRatePerBlock = BigNumber.from(yield whitePaperModelContract.callStatic.baseRatePerBlock());
            this.multiplierPerBlock = BigNumber.from(yield whitePaperModelContract.callStatic.multiplierPerBlock());
            const cTokenContract = new Contract(assetAddress, CTokenInterfacesArtifact.abi, provider);
            this.reserveFactorMantissa = BigNumber.from(yield cTokenContract.callStatic.reserveFactorMantissa());
            this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(yield cTokenContract.callStatic.adminFeeMantissa()));
            this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(yield cTokenContract.callStatic.fuseFeeMantissa()));
            this.initialized = true;
        });
    }
    _init(interestRateModelAddress, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(interestRateModelAddress, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa, provider, "IRMMMMMM PARAMS WPIRM");
            const whitePaperModelContract = new Contract(interestRateModelAddress, WhitePaperInterestRateModelArtifact.abi, provider);
            this.baseRatePerBlock = BigNumber.from(yield whitePaperModelContract.callStatic.baseRatePerBlock());
            this.multiplierPerBlock = BigNumber.from(yield whitePaperModelContract.callStatic.multiplierPerBlock());
            this.reserveFactorMantissa = BigNumber.from(reserveFactorMantissa);
            this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(adminFeeMantissa));
            this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(fuseFeeMantissa));
            this.initialized = true;
        });
    }
    __init(baseRatePerBlock, multiplierPerBlock, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa) {
        return __awaiter(this, void 0, void 0, function* () {
            this.baseRatePerBlock = BigNumber.from(baseRatePerBlock);
            this.multiplierPerBlock = BigNumber.from(multiplierPerBlock);
            this.reserveFactorMantissa = BigNumber.from(reserveFactorMantissa);
            this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(adminFeeMantissa));
            this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(fuseFeeMantissa));
            this.initialized = true;
        });
    }
    getBorrowRate(utilizationRate) {
        if (!this.initialized || !this.multiplierPerBlock || !this.baseRatePerBlock)
            throw new Error("Interest rate model class not initialized.");
        return utilizationRate.mul(this.multiplierPerBlock).div(constants.WeiPerEther).add(this.baseRatePerBlock);
    }
    getSupplyRate(utilizationRate) {
        if (!this.initialized || !this.reserveFactorMantissa)
            throw new Error("Interest rate model class not initialized.");
        const oneMinusReserveFactor = constants.WeiPerEther.sub(this.reserveFactorMantissa);
        const borrowRate = this.getBorrowRate(utilizationRate);
        const rateToPool = borrowRate.mul(oneMinusReserveFactor).div(constants.WeiPerEther);
        return utilizationRate.mul(rateToPool).div(constants.WeiPerEther);
    }
}
WhitePaperInterestRateModel.RUNTIME_BYTECODE_HASH = utils.keccak256(WhitePaperInterestRateModelArtifact.deployedBytecode.object);
