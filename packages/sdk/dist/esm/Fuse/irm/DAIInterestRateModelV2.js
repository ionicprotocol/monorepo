var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import JumpRateModel from "./JumpRateModel";
import { Contract, BigNumber, utils } from "ethers";
import DAIInterestRateModelV2Artifact from "../../../out/DAIInterestRateModelV2.sol/DAIInterestRateModelV2.json";
import CTokenInterfacesArtifact from "../../../out/CTokenInterfaces.sol/CTokenInterface.json";
export default class DAIInterestRateModelV2 extends JumpRateModel {
    init(interestRateModelAddress, assetAddress, provider) {
        const _super = Object.create(null, {
            init: { get: () => super.init }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.init.call(this, interestRateModelAddress, assetAddress, provider);
            const interestRateContract = new Contract(interestRateModelAddress, DAIInterestRateModelV2Artifact.abi, provider);
            this.dsrPerBlock = BigNumber.from(yield interestRateContract.callStatic.dsrPerBlock());
            const cTokenContract = new Contract(assetAddress, CTokenInterfacesArtifact.abi, provider);
            this.cash = BigNumber.from(yield cTokenContract.callStatic.getCash());
            this.borrows = BigNumber.from(yield cTokenContract.callStatic.totalBorrowsCurrent());
            this.reserves = BigNumber.from(yield cTokenContract.callStatic.totalReserves());
        });
    }
    _init(interestRateModelAddress, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa, provider) {
        const _super = Object.create(null, {
            _init: { get: () => super._init }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super._init.call(this, interestRateModelAddress, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa, provider);
            const interestRateContract = new Contract(interestRateModelAddress, DAIInterestRateModelV2Artifact.abi, provider);
            this.dsrPerBlock = BigNumber.from(yield interestRateContract.callStatic.dsrPerBlock());
            this.cash = BigNumber.from(0);
            this.borrows = BigNumber.from(0);
            this.reserves = BigNumber.from(0);
        });
    }
    __init(baseRatePerBlock, multiplierPerBlock, jumpMultiplierPerBlock, kink, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa) {
        const _super = Object.create(null, {
            __init: { get: () => super.__init }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.__init.call(this, baseRatePerBlock, multiplierPerBlock, jumpMultiplierPerBlock, kink, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa);
            this.dsrPerBlock = BigNumber.from(0); // TODO: Make this work if DSR ever goes positive again
            this.cash = BigNumber.from(0);
            this.borrows = BigNumber.from(0);
            this.reserves = BigNumber.from(0);
        });
    }
    getSupplyRate(utilizationRate) {
        if (!this.initialized || !this.cash || !this.borrows || !this.reserves || !this.dsrPerBlock)
            throw new Error("Interest rate model class not initialized.");
        // const protocolRate = super.getSupplyRate(utilizationRate, this.reserveFactorMantissa); //todo - do we need this
        const protocolRate = super.getSupplyRate(utilizationRate);
        const underlying = this.cash.add(this.borrows).sub(this.reserves);
        if (underlying.isZero()) {
            return protocolRate;
        }
        else {
            const cashRate = this.cash.mul(this.dsrPerBlock).div(underlying);
            return cashRate.add(protocolRate);
        }
    }
}
DAIInterestRateModelV2.RUNTIME_BYTECODE_HASH = utils.keccak256(DAIInterestRateModelV2Artifact.deployedBytecode.object);
