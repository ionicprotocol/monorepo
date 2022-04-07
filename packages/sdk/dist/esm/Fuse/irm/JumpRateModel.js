var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BigNumber, Contract, utils } from "ethers";
import JumpRateModelArtifact from "../../../out/JumpRateModel.sol/JumpRateModel.json";
import CTokenInterfacesArtifact from "../../../out/CTokenInterfaces.sol/CTokenInterface.json";
export default class JumpRateModel {
    init(interestRateModelAddress, assetAddress, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const jumpRateModelContract = new Contract(interestRateModelAddress, JumpRateModelArtifact.abi, provider);
            this.baseRatePerBlock = BigNumber.from(yield jumpRateModelContract.callStatic.baseRatePerBlock());
            this.multiplierPerBlock = BigNumber.from(yield jumpRateModelContract.callStatic.multiplierPerBlock());
            this.jumpMultiplierPerBlock = BigNumber.from(yield jumpRateModelContract.callStatic.jumpMultiplierPerBlock());
            this.kink = BigNumber.from(yield jumpRateModelContract.callStatic.kink());
            const cTokenContract = new Contract(assetAddress, CTokenInterfacesArtifact.abi, provider);
            this.reserveFactorMantissa = BigNumber.from(yield cTokenContract.callStatic.reserveFactorMantissa());
            this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(yield cTokenContract.callStatic.adminFeeMantissa()));
            this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(yield cTokenContract.callStatic.fuseFeeMantissa()));
            this.initialized = true;
        });
    }
    _init(interestRateModelAddress, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const jumpRateModelContract = new Contract(interestRateModelAddress, JumpRateModelArtifact.abi, provider);
            this.baseRatePerBlock = BigNumber.from(yield jumpRateModelContract.callStatic.baseRatePerBlock());
            this.multiplierPerBlock = BigNumber.from(yield jumpRateModelContract.callStatic.multiplierPerBlock());
            this.jumpMultiplierPerBlock = BigNumber.from(yield jumpRateModelContract.callStatic.jumpMultiplierPerBlock());
            this.kink = BigNumber.from(yield jumpRateModelContract.callStatic.kink());
            this.reserveFactorMantissa = BigNumber.from(reserveFactorMantissa);
            this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(adminFeeMantissa));
            this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(fuseFeeMantissa));
            this.initialized = true;
        });
    }
    __init(baseRatePerBlock, multiplierPerBlock, jumpMultiplierPerBlock, kink, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa) {
        return __awaiter(this, void 0, void 0, function* () {
            this.baseRatePerBlock = BigNumber.from(baseRatePerBlock);
            this.multiplierPerBlock = BigNumber.from(multiplierPerBlock);
            this.jumpMultiplierPerBlock = BigNumber.from(jumpMultiplierPerBlock);
            this.kink = BigNumber.from(kink);
            this.reserveFactorMantissa = BigNumber.from(reserveFactorMantissa);
            this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(adminFeeMantissa));
            this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(fuseFeeMantissa));
            this.initialized = true;
        });
    }
    getBorrowRate(utilizationRate) {
        if (!this.initialized ||
            !this.kink ||
            !this.multiplierPerBlock ||
            !this.baseRatePerBlock ||
            !this.jumpMultiplierPerBlock)
            throw new Error("Interest rate model class not initialized.");
        if (utilizationRate.lte(this.kink)) {
            return utilizationRate.mul(this.multiplierPerBlock).div(utils.parseEther("1")).add(this.baseRatePerBlock);
        }
        else {
            const normalRate = this.kink.mul(this.multiplierPerBlock).div(utils.parseEther("1")).add(this.baseRatePerBlock);
            const excessUtil = utilizationRate.sub(this.kink);
            return excessUtil.mul(this.jumpMultiplierPerBlock).div(utils.parseEther("1")).add(normalRate);
        }
    }
    getSupplyRate(utilizationRate) {
        if (!this.initialized || !this.reserveFactorMantissa)
            throw new Error("Interest rate model class not initialized.");
        const oneMinusReserveFactor = utils.parseEther("1").sub(this.reserveFactorMantissa);
        const borrowRate = this.getBorrowRate(utilizationRate);
        const rateToPool = borrowRate.mul(oneMinusReserveFactor).div(utils.parseEther("1"));
        return utilizationRate.mul(rateToPool).div(utils.parseEther("1"));
    }
}
JumpRateModel.RUNTIME_BYTECODE_HASH = utils.keccak256(JumpRateModelArtifact.deployedBytecode.object);
