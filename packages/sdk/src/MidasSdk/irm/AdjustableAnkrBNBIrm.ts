import { Web3Provider } from "@ethersproject/providers";
import { BigNumber, BigNumberish, utils } from "ethers";

import AdjustableAnkrBNBIrmArtifact from "../../../artifacts/AdjustableAnkrBNBIrm.json";
import { getContract } from "../utils";

import JumpRateModel from "./JumpRateModel";

export default class AdjustableAnkrBNBIrm extends JumpRateModel {
  static RUNTIME_BYTECODE_HASH = utils.keccak256(AdjustableAnkrBNBIrmArtifact.deployedBytecode.object);
  async _init(
    interestRateModelAddress: string,
    reserveFactorMantissa: BigNumberish,
    adminFeeMantissa: BigNumberish,
    fuseFeeMantissa: BigNumberish,
    provider: Web3Provider
  ): Promise<void> {
    const interestRateModelContract = getContract(interestRateModelAddress, AdjustableAnkrBNBIrmArtifact.abi, provider);
    this.baseRatePerBlock = BigNumber.from(await interestRateModelContract.callStatic.getBaseRatePerBlock());
    this.multiplierPerBlock = BigNumber.from(await interestRateModelContract.callStatic.getMultiplierPerBlock());
    this.jumpMultiplierPerBlock = BigNumber.from(await interestRateModelContract.callStatic.jumpMultiplierPerBlock());
    this.kink = BigNumber.from(await interestRateModelContract.callStatic.kink());

    this.reserveFactorMantissa = BigNumber.from(reserveFactorMantissa);
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(adminFeeMantissa));
    this.reserveFactorMantissa = this.reserveFactorMantissa.add(BigNumber.from(fuseFeeMantissa));

    this.initialized = true;
  }
}
