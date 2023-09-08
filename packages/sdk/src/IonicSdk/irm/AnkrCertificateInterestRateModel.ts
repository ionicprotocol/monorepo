import { Web3Provider } from "@ethersproject/providers";
import { InterestRateModel } from "@ionicprotocol/types";
import { BigNumber, BigNumberish, utils } from "ethers";

import AnkrCertificateInterestRateModelArtifact from "../../../artifacts/AnkrCertificateInterestRateModel.sol/AnkrCertificateInterestRateModel.json";
import { abi as CTokenFirstExtensionABI } from "../../../artifacts/CTokenFirstExtension.sol/CTokenFirstExtension.json";
import { CTokenFirstExtension } from "../../../typechain/CTokenFirstExtension";
import { getContract } from "../utils";

export default class AnkrCertificateInterestRateModel implements InterestRateModel {
  initialized: boolean | undefined;
  baseRatePerBlock: BigNumber | undefined;
  multiplierPerBlock: BigNumber | undefined;
  jumpMultiplierPerBlock: BigNumber | undefined;
  kink: BigNumber | undefined;
  reserveFactorMantissa: BigNumber | undefined;

  async init(interestRateModelAddress: string, assetAddress: string, provider: Web3Provider): Promise<void> {
    const jumpRateModelContract = getContract(
      interestRateModelAddress,
      AnkrCertificateInterestRateModelArtifact.abi,
      provider
    );
    this.multiplierPerBlock = BigNumber.from(await jumpRateModelContract.callStatic.getMultiplierPerBlock());
    this.jumpMultiplierPerBlock = BigNumber.from(await jumpRateModelContract.callStatic.jumpMultiplierPerBlock());
    this.baseRatePerBlock = BigNumber.from(await jumpRateModelContract.callStatic.getBaseRatePerBlock());
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
    const jumpRateModelContract = getContract(
      interestRateModelAddress,
      AnkrCertificateInterestRateModelArtifact.abi,
      provider
    );
    this.multiplierPerBlock = BigNumber.from(await jumpRateModelContract.callStatic.getMultiplierPerBlock());
    this.jumpMultiplierPerBlock = BigNumber.from(await jumpRateModelContract.callStatic.jumpMultiplierPerBlock());
    this.baseRatePerBlock = BigNumber.from(await jumpRateModelContract.callStatic.getBaseRatePerBlock());
    this.kink = BigNumber.from(await jumpRateModelContract.callStatic.kink());
    this.reserveFactorMantissa = BigNumber.from(reserveFactorMantissa);
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(adminFeeMantissa));
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(ionicFeeMantissa));

    this.initialized = true;
  }

  async __init(
    baseRatePerBlock: BigNumberish,
    jumpMultiplierPerBlock: BigNumberish,
    kink: BigNumberish,
    reserveFactorMantissa: BigNumberish,
    adminFeeMantissa: BigNumberish,
    ionicFeeMantissa: BigNumberish
  ) {
    this.baseRatePerBlock = BigNumber.from(baseRatePerBlock);
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

    const normalRate = utilizationRate
      .mul(this.multiplierPerBlock)
      .div(utils.parseEther("1"))
      .add(this.baseRatePerBlock);

    if (utilizationRate.lte(this.kink)) {
      return normalRate;
    } else {
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
