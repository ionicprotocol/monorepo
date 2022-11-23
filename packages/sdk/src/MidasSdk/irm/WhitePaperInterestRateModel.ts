import { Web3Provider } from "@ethersproject/providers";
import { InterestRateModel } from "@midas-capital/types";
import { BigNumber, BigNumberish, constants, utils } from "ethers";

import CTokenInterfaceArtifact from "@artifacts/CTokenInterface.json";
import WhitePaperInterestRateModelArtifact from "@artifacts/WhitePaperInterestRateModel.json";
import { getContract } from "../utils";

export default class WhitePaperInterestRateModel implements InterestRateModel {
  static RUNTIME_BYTECODE_HASH = utils.keccak256(WhitePaperInterestRateModelArtifact.deployedBytecode.object);

  initialized: boolean | undefined;
  baseRatePerBlock: BigNumber | undefined;
  multiplierPerBlock: BigNumber | undefined;
  reserveFactorMantissa: BigNumber | undefined;

  async init(interestRateModelAddress: string, assetAddress: string, provider: any) {
    const whitePaperModelContract = getContract(
      interestRateModelAddress,
      WhitePaperInterestRateModelArtifact.abi,
      provider
    );

    this.baseRatePerBlock = BigNumber.from(await whitePaperModelContract.callStatic.baseRatePerBlock());
    this.multiplierPerBlock = BigNumber.from(await whitePaperModelContract.callStatic.multiplierPerBlock());

    const cTokenContract = getContract(assetAddress, CTokenInterfaceArtifact.abi, provider);
    this.reserveFactorMantissa = BigNumber.from(await cTokenContract.callStatic.reserveFactorMantissa());
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(
      BigNumber.from(await cTokenContract.callStatic.adminFeeMantissa())
    );
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(
      BigNumber.from(await cTokenContract.callStatic.fuseFeeMantissa())
    );
    this.initialized = true;
  }

  async _init(
    interestRateModelAddress: string,
    reserveFactorMantissa: BigNumberish,
    adminFeeMantissa: BigNumberish,
    fuseFeeMantissa: BigNumberish,
    provider: Web3Provider
  ) {
    const whitePaperModelContract = getContract(
      interestRateModelAddress,
      WhitePaperInterestRateModelArtifact.abi,
      provider
    );

    this.baseRatePerBlock = BigNumber.from(await whitePaperModelContract.callStatic.baseRatePerBlock());
    this.multiplierPerBlock = BigNumber.from(await whitePaperModelContract.callStatic.multiplierPerBlock());

    this.reserveFactorMantissa = BigNumber.from(reserveFactorMantissa);
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(adminFeeMantissa));
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(fuseFeeMantissa));

    this.initialized = true;
  }

  async __init(
    baseRatePerBlock: BigNumberish,
    multiplierPerBlock: BigNumberish,
    reserveFactorMantissa: BigNumberish,
    adminFeeMantissa: BigNumberish,
    fuseFeeMantissa: BigNumberish
  ) {
    this.baseRatePerBlock = BigNumber.from(baseRatePerBlock);
    this.multiplierPerBlock = BigNumber.from(multiplierPerBlock);

    this.reserveFactorMantissa = BigNumber.from(reserveFactorMantissa);
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(adminFeeMantissa));
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(fuseFeeMantissa));
    this.initialized = true;
  }

  getBorrowRate(utilizationRate: BigNumber) {
    if (!this.initialized || !this.multiplierPerBlock || !this.baseRatePerBlock)
      throw new Error("Interest rate model class not initialized.");
    return utilizationRate.mul(this.multiplierPerBlock).div(constants.WeiPerEther).add(this.baseRatePerBlock);
  }

  getSupplyRate(utilizationRate: BigNumber): BigNumber {
    if (!this.initialized || !this.reserveFactorMantissa) throw new Error("Interest rate model class not initialized.");

    const oneMinusReserveFactor = constants.WeiPerEther.sub(this.reserveFactorMantissa);
    const borrowRate = this.getBorrowRate(utilizationRate);
    const rateToPool = borrowRate.mul(oneMinusReserveFactor).div(constants.WeiPerEther);
    return utilizationRate.mul(rateToPool).div(constants.WeiPerEther);
  }
}
