import { Web3Provider } from "@ethersproject/providers";
import { BigNumber, BigNumberish, utils } from "ethers";

import AdjustableAnkrBNBIrmArtifact from "../../../artifacts/AdjustableAnkrBNBIrm.sol/AdjustableAnkrBNBIrm.json";
import { abi as CTokenFirstExtensionABI } from "../../../artifacts/CTokenFirstExtension.sol/CTokenFirstExtension.json";
import { CTokenFirstExtension } from "../../../typechain/CTokenFirstExtension";
import { getContract } from "../utils";

import JumpRateModel from "./JumpRateModel";

export default class AdjustableAnkrBNBIrm extends JumpRateModel {
  static RUNTIME_BYTECODE_HASH = utils.keccak256(AdjustableAnkrBNBIrmArtifact.deployedBytecode.object);

  async init(interestRateModelAddress: string, assetAddress: string, provider: Web3Provider): Promise<void> {
    const interestRateModelContract = getContract(interestRateModelAddress, AdjustableAnkrBNBIrmArtifact.abi, provider);
    this.baseRatePerBlock = BigNumber.from(await interestRateModelContract.callStatic.getBaseRatePerBlock());
    this.multiplierPerBlock = BigNumber.from(await interestRateModelContract.callStatic.getMultiplierPerBlock());
    this.jumpMultiplierPerBlock = BigNumber.from(await interestRateModelContract.callStatic.jumpMultiplierPerBlock());
    this.kink = BigNumber.from(await interestRateModelContract.callStatic.kink());
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
    const interestRateModelContract = getContract(interestRateModelAddress, AdjustableAnkrBNBIrmArtifact.abi, provider);
    this.baseRatePerBlock = BigNumber.from(await interestRateModelContract.callStatic.getBaseRatePerBlock());
    this.multiplierPerBlock = BigNumber.from(await interestRateModelContract.callStatic.getMultiplierPerBlock());
    this.jumpMultiplierPerBlock = BigNumber.from(await interestRateModelContract.callStatic.jumpMultiplierPerBlock());
    this.kink = BigNumber.from(await interestRateModelContract.callStatic.kink());

    this.reserveFactorMantissa = BigNumber.from(reserveFactorMantissa);
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(adminFeeMantissa));
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(ionicFeeMantissa));

    this.initialized = true;
  }
}
