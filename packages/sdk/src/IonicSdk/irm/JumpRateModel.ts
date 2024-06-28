import { Address, getContract, Hex, keccak256, parseEther, PublicClient } from "viem";

import JumpRateModelArtifact from "../../../artifacts/JumpRateModel.sol/JumpRateModel.json";
import { cTokenFirstExtensionAbi, jumpRateModelAbi } from "../../generated";

export default class JumpRateModel {
  static RUNTIME_BYTECODE_HASH = keccak256(JumpRateModelArtifact.deployedBytecode.object as Hex);

  initialized: boolean | undefined;
  baseRatePerBlock: bigint | undefined;
  multiplierPerBlock: bigint | undefined;
  jumpMultiplierPerBlock: bigint | undefined;
  kink: bigint | undefined;
  reserveFactorMantissa: bigint | undefined;

  async init(interestRateModelAddress: Address, assetAddress: Address, client: PublicClient): Promise<void> {
    const jumpRateModelContract = getContract({ address: interestRateModelAddress, abi: jumpRateModelAbi, client });
    this.baseRatePerBlock = await jumpRateModelContract.read.baseRatePerBlock();
    this.multiplierPerBlock = await jumpRateModelContract.read.multiplierPerBlock();
    this.jumpMultiplierPerBlock = await jumpRateModelContract.read.jumpMultiplierPerBlock();
    this.kink = await jumpRateModelContract.read.kink();
    const cTokenContract = getContract({ address: assetAddress, abi: cTokenFirstExtensionAbi, client });
    this.reserveFactorMantissa = await cTokenContract.read.reserveFactorMantissa();
    this.reserveFactorMantissa = this.reserveFactorMantissa + (await cTokenContract.read.adminFeeMantissa());
    this.reserveFactorMantissa = this.reserveFactorMantissa + (await cTokenContract.read.ionicFeeMantissa());
    this.initialized = true;
  }

  async _init(
    interestRateModelAddress: Address,
    reserveFactorMantissa: bigint,
    adminFeeMantissa: bigint,
    ionicFeeMantissa: bigint,
    client: PublicClient
  ): Promise<void> {
    const jumpRateModelContract = getContract({ address: interestRateModelAddress, abi: jumpRateModelAbi, client });
    this.baseRatePerBlock = await jumpRateModelContract.read.baseRatePerBlock();
    this.multiplierPerBlock = await jumpRateModelContract.read.multiplierPerBlock();
    this.jumpMultiplierPerBlock = await jumpRateModelContract.read.jumpMultiplierPerBlock();
    this.kink = await jumpRateModelContract.read.kink();
    this.reserveFactorMantissa = reserveFactorMantissa;
    this.reserveFactorMantissa = this.reserveFactorMantissa + adminFeeMantissa;
    this.reserveFactorMantissa = this.reserveFactorMantissa + ionicFeeMantissa;
    this.initialized = true;
  }

  async __init(
    baseRatePerBlock: bigint,
    multiplierPerBlock: bigint,
    jumpMultiplierPerBlock: bigint,
    kink: bigint,
    reserveFactorMantissa: bigint,
    adminFeeMantissa: bigint,
    ionicFeeMantissa: bigint
  ) {
    this.baseRatePerBlock = baseRatePerBlock;
    this.multiplierPerBlock = multiplierPerBlock;
    this.jumpMultiplierPerBlock = jumpMultiplierPerBlock;
    this.kink = kink;

    this.reserveFactorMantissa = reserveFactorMantissa;
    this.reserveFactorMantissa = this.reserveFactorMantissa + adminFeeMantissa;
    this.reserveFactorMantissa = this.reserveFactorMantissa + ionicFeeMantissa;

    this.initialized = true;
  }

  getBorrowRate(utilizationRate: bigint) {
    if (
      !this.initialized ||
      !this.kink ||
      !this.multiplierPerBlock ||
      !this.baseRatePerBlock ||
      !this.jumpMultiplierPerBlock
    )
      throw new Error("Interest rate model class not initialized.");
    if (utilizationRate <= this.kink) {
      return (utilizationRate * this.multiplierPerBlock) / parseEther("1") + this.baseRatePerBlock;
    } else {
      const normalRate = (this.kink * this.multiplierPerBlock) / parseEther("1") + this.baseRatePerBlock;
      const excessUtil = utilizationRate - this.kink;
      return (excessUtil * this.jumpMultiplierPerBlock) / parseEther("1") + normalRate;
    }
  }

  getSupplyRate(utilizationRate: bigint) {
    if (!this.initialized || !this.reserveFactorMantissa) throw new Error("Interest rate model class not initialized.");
    const oneMinusReserveFactor = parseEther("1") - this.reserveFactorMantissa;
    const borrowRate = this.getBorrowRate(utilizationRate);
    const rateToPool = (borrowRate * oneMinusReserveFactor) / parseEther("1");
    return (utilizationRate * rateToPool) / parseEther("1");
  }
}
