import { Web3Provider } from "@ethersproject/providers";
import { BigNumber, BigNumberish, utils } from "ethers";

import CTokenInterfacesArtifact from "../../../artifacts/CTokenInterface.json";
import DAIInterestRateModelV2Artifact from "../../../artifacts/DAIInterestRateModelV2.json";
import { getContract } from "../utils";

import JumpRateModel from "./JumpRateModel";

export default class DAIInterestRateModelV2 extends JumpRateModel {
  static RUNTIME_BYTECODE_HASH = utils.keccak256(DAIInterestRateModelV2Artifact.deployedBytecode.object);

  initialized: boolean | undefined;
  dsrPerBlock: BigNumber | undefined;
  cash: BigNumber | undefined;
  borrows: BigNumber | undefined;
  reserves: BigNumber | undefined;
  reserveFactorMantissa: BigNumber | undefined;

  async init(interestRateModelAddress: string, assetAddress: string, provider: any) {
    await super.init(interestRateModelAddress, assetAddress, provider);

    const interestRateContract = getContract(interestRateModelAddress, DAIInterestRateModelV2Artifact.abi, provider);

    this.dsrPerBlock = BigNumber.from(await interestRateContract.callStatic.dsrPerBlock());

    const cTokenContract = getContract(assetAddress, CTokenInterfacesArtifact.abi, provider);

    this.cash = BigNumber.from(await cTokenContract.callStatic.getCash());
    this.borrows = BigNumber.from(await cTokenContract.callStatic.totalBorrowsCurrent());
    this.reserves = BigNumber.from(await cTokenContract.callStatic.totalReserves());
  }

  async _init(
    interestRateModelAddress: string,
    reserveFactorMantissa: BigNumberish,
    adminFeeMantissa: BigNumberish,
    ionicFeeMantissa: BigNumberish,
    provider: Web3Provider
  ) {
    await super._init(interestRateModelAddress, reserveFactorMantissa, adminFeeMantissa, ionicFeeMantissa, provider);

    const interestRateContract = getContract(interestRateModelAddress, DAIInterestRateModelV2Artifact.abi, provider);
    this.dsrPerBlock = BigNumber.from(await interestRateContract.callStatic.dsrPerBlock());
    this.cash = BigNumber.from(0);
    this.borrows = BigNumber.from(0);
    this.reserves = BigNumber.from(0);
  }

  async __init(
    baseRatePerBlock: BigNumberish,
    multiplierPerBlock: BigNumberish,
    jumpMultiplierPerBlock: BigNumberish,
    kink: BigNumberish,
    reserveFactorMantissa: BigNumberish,
    adminFeeMantissa: BigNumberish,
    ionicFeeMantissa: BigNumberish
  ) {
    await super.__init(
      baseRatePerBlock,
      multiplierPerBlock,
      jumpMultiplierPerBlock,
      kink,
      reserveFactorMantissa,
      adminFeeMantissa,
      ionicFeeMantissa
    );
    this.dsrPerBlock = BigNumber.from(0); // TODO: Make this work if DSR ever goes positive again
    this.cash = BigNumber.from(0);
    this.borrows = BigNumber.from(0);
    this.reserves = BigNumber.from(0);
  }

  getSupplyRate(utilizationRate: BigNumber) {
    if (!this.initialized || !this.cash || !this.borrows || !this.reserves || !this.dsrPerBlock)
      throw new Error("Interest rate model class not initialized.");

    // const protocolRate = super.getSupplyRate(utilizationRate, this.reserveFactorMantissa); //todo - do we need this
    const protocolRate = super.getSupplyRate(utilizationRate);
    const underlying = this.cash.add(this.borrows).sub(this.reserves);

    if (underlying.isZero()) {
      return protocolRate;
    } else {
      const cashRate = this.cash.mul(this.dsrPerBlock).div(underlying);
      return cashRate.add(protocolRate);
    }
  }
}
