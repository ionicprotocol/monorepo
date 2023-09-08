import { Web3Provider } from "@ethersproject/providers";
import { InterestRateModel } from "@ionicprotocol/types";
import { BigNumber, BigNumberish, utils } from "ethers";

import { abi as CTokenFirstExtensionABI } from "../../../artifacts/CTokenFirstExtension.sol/CTokenFirstExtension.json";
import JumpRateModelArtifact from "../../../artifacts/JumpRateModel.sol/JumpRateModel.json";
import { CTokenFirstExtension } from "../../../typechain/CTokenFirstExtension";
import { getContract } from "../utils";

export default class JumpRateModel implements InterestRateModel {
  static RUNTIME_BYTECODE_HASH = utils.keccak256(JumpRateModelArtifact.deployedBytecode.object);

  initialized: boolean | undefined;
  baseRatePerBlock: BigNumber | undefined;
  multiplierPerBlock: BigNumber | undefined;
  jumpMultiplierPerBlock: BigNumber | undefined;
  kink: BigNumber | undefined;
  reserveFactorMantissa: BigNumber | undefined;

  async init(interestRateModelAddress: string, assetAddress: string, provider: Web3Provider): Promise<void> {
    const jumpRateModelContract = getContract(interestRateModelAddress, JumpRateModelArtifact.abi, provider);
    this.baseRatePerBlock = BigNumber.from(await jumpRateModelContract.callStatic.baseRatePerBlock());
    this.multiplierPerBlock = BigNumber.from(await jumpRateModelContract.callStatic.multiplierPerBlock());
    this.jumpMultiplierPerBlock = BigNumber.from(await jumpRateModelContract.callStatic.jumpMultiplierPerBlock());
    this.kink = BigNumber.from(await jumpRateModelContract.callStatic.kink());
    const cTokenContract = getContract(assetAddress, CTokenFirstExtensionABI, provider) as CTokenFirstExtension;
    this.reserveFactorMantissa = BigNumber.from(await cTokenContract.callStatic.reserveFactorMantissa());
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(
      BigNumber.from(await cTokenContract.callStatic.adminFeeMantissa())
    );
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(
      BigNumber.from(await cTokenContract.callStatic.ionicFeeMantissa())
    );
    this.initialized = true;
  }

  async _init(
    interestRateModelAddress: string,
    reserveFactorMantissa: BigNumberish,
    adminFeeMantissa: BigNumberish,
    ionicFeeMantissa: BigNumberish,
    provider: Web3Provider
  ): Promise<void> {
    const jumpRateModelContract = getContract(interestRateModelAddress, JumpRateModelArtifact.abi, provider);
    this.baseRatePerBlock = BigNumber.from(await jumpRateModelContract.callStatic.baseRatePerBlock());
    this.multiplierPerBlock = BigNumber.from(await jumpRateModelContract.callStatic.multiplierPerBlock());
    this.jumpMultiplierPerBlock = BigNumber.from(await jumpRateModelContract.callStatic.jumpMultiplierPerBlock());
    this.kink = BigNumber.from(await jumpRateModelContract.callStatic.kink());

    this.reserveFactorMantissa = BigNumber.from(reserveFactorMantissa);
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(adminFeeMantissa));
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(ionicFeeMantissa));

    this.initialized = true;
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
    this.baseRatePerBlock = BigNumber.from(baseRatePerBlock);
    this.multiplierPerBlock = BigNumber.from(multiplierPerBlock);
    this.jumpMultiplierPerBlock = BigNumber.from(jumpMultiplierPerBlock);
    this.kink = BigNumber.from(kink);

    this.reserveFactorMantissa = BigNumber.from(reserveFactorMantissa);
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(adminFeeMantissa));
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(ionicFeeMantissa));

    this.initialized = true;
  }

  getBorrowRate(utilizationRate: BigNumber) {
    if (
      !this.initialized ||
      !this.kink ||
      !this.multiplierPerBlock ||
      !this.baseRatePerBlock ||
      !this.jumpMultiplierPerBlock
    )
      throw new Error("Interest rate model class not initialized.");
    if (utilizationRate.lte(this.kink)) {
      return utilizationRate.mul(this.multiplierPerBlock).div(utils.parseEther("1")).add(this.baseRatePerBlock);
    } else {
      const normalRate = this.kink.mul(this.multiplierPerBlock).div(utils.parseEther("1")).add(this.baseRatePerBlock);
      const excessUtil = utilizationRate.sub(this.kink);
      return excessUtil.mul(this.jumpMultiplierPerBlock).div(utils.parseEther("1")).add(normalRate);
    }
  }

  getSupplyRate(utilizationRate: BigNumber) {
    if (!this.initialized || !this.reserveFactorMantissa) throw new Error("Interest rate model class not initialized.");
    const oneMinusReserveFactor = utils.parseEther("1").sub(this.reserveFactorMantissa);
    const borrowRate = this.getBorrowRate(utilizationRate);
    const rateToPool = borrowRate.mul(oneMinusReserveFactor).div(utils.parseEther("1"));
    return utilizationRate.mul(rateToPool).div(utils.parseEther("1"));
  }
}
