import { chainIdToConfig } from "@ionicprotocol/chains";
import { Address, formatUnits, Hex, keccak256, parseEther, parseUnits, PublicClient } from "viem";

import PrudentiaInterestRateModelArtifact from "../../artifacts/PrudentiaInterestRateModel.json";
import { cTokenFirstExtensionAbi } from "../../generated";
import { getContract } from "../utils";

import {
  PREDICTIVE_UTILIZATION_RATE,
  CONTRACT_ADDRESS_PID_COMPUTER,
  prudentiaPidComputerAbi,
  prudentiaSlopedIRComputerAbi,
  RATE_DECIMALS,
  CONTRACT_ADDRESS_SLOPED_IR_COMPUTER
} from "./prudentia";
import { mode } from "viem/chains";

export const MINUTES_PER_YEAR = 24 * 365 * 60;

function getBlockTimePerMinuteByChainId(chainId: number): number {
  const chain = chainIdToConfig[chainId];

  return chain ? Number(BigInt(chain.specificParams.blocksPerYear) / BigInt(MINUTES_PER_YEAR)) : 0;
}

export default class PrudentiaInterestRateModel {
  static RUNTIME_BYTECODE_HASH = keccak256(PrudentiaInterestRateModelArtifact.deployedBytecode as Hex);

  initialized: boolean | undefined;
  pidRate: bigint | undefined;
  slopeConfig:
    | {
        base: bigint;
        baseSlope: bigint;
        kink: bigint;
        kinkSlope: bigint;
      }
    | undefined;
  generalConfig: { max: bigint; min: bigint; offset: bigint; scalar: number } | undefined;
  defaultOneXScalar: number | undefined;
  reserveFactorMantissa: bigint | undefined;

  async init(_: Address, assetAddress: Address, client: PublicClient): Promise<void> {
    const cTokenContract = getContract({ address: assetAddress, abi: cTokenFirstExtensionAbi, client });
    const chainId = await client.getChainId();
    const contract = getContract({
      address: CONTRACT_ADDRESS_SLOPED_IR_COMPUTER[chainId],
      abi: prudentiaSlopedIRComputerAbi,
      client
    });
    const contractPid = getContract({
      address: CONTRACT_ADDRESS_PID_COMPUTER[chainId],
      abi: prudentiaPidComputerAbi,
      client
    });

    const underlying = await cTokenContract.read.underlying();
    this.pidRate = await contractPid.read.computeRate([underlying]);
    this.slopeConfig = await contract.read.getSlopeConfig([underlying]);
    this.generalConfig = await contract.read.getConfig([underlying]);
    this.defaultOneXScalar = await contract.read.defaultOneXScalar();

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
    throw new Error("Not implemented");
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
    throw new Error("Not implemented");
  }

  getBorrowRate(utilizationRate: bigint) {
    if (!this.slopeConfig || !this.generalConfig || !this.defaultOneXScalar || !this.pidRate)
      throw new Error("Interest rate model class not initialized.");
    let predictedSlopeRate = this.slopeConfig.base + utilizationRate * this.slopeConfig.baseSlope;

    if (utilizationRate > this.slopeConfig.kink) {
      predictedSlopeRate = predictedSlopeRate + (utilizationRate - this.slopeConfig.kink) * this.slopeConfig.kinkSlope;
    }

    // Scale and add offset
    predictedSlopeRate =
      (predictedSlopeRate * BigInt(this.generalConfig.scalar)) / BigInt(this.defaultOneXScalar) +
      this.generalConfig.offset;

    if (predictedSlopeRate > this.generalConfig.max) {
      predictedSlopeRate = this.generalConfig.max;
    } else if (predictedSlopeRate < this.generalConfig.min) {
      predictedSlopeRate = this.generalConfig.min;
    }

    console.log(`Predicted slope rate: ${formatUnits(predictedSlopeRate, RATE_DECIMALS - 2)}%`);

    const predictedRate = this.pidRate + predictedSlopeRate;

    console.log(`Predicted rate: ${formatUnits(predictedRate, RATE_DECIMALS - 2)}%`);
    return predictedRate;
  }

  getSupplyRate(utilizationRate: bigint) {
    if (!this.slopeConfig || !this.generalConfig || !this.defaultOneXScalar || !this.pidRate)
      throw new Error("Interest rate model class not initialized.");
    let predictedSlopeRate = this.slopeConfig.base + utilizationRate * this.slopeConfig.baseSlope;

    if (utilizationRate > this.slopeConfig.kink) {
      predictedSlopeRate = predictedSlopeRate + (utilizationRate - this.slopeConfig.kink) * this.slopeConfig.kinkSlope;
    }

    // Scale and add offset
    predictedSlopeRate =
      (predictedSlopeRate * BigInt(this.generalConfig.scalar)) / BigInt(this.defaultOneXScalar) +
      this.generalConfig.offset;

    if (predictedSlopeRate > this.generalConfig.max) {
      predictedSlopeRate = this.generalConfig.max;
    } else if (predictedSlopeRate < this.generalConfig.min) {
      predictedSlopeRate = this.generalConfig.min;
    }

    console.log(`Predicted slope rate: ${formatUnits(predictedSlopeRate, RATE_DECIMALS - 2)}%`);

    const predictedRate = this.pidRate + predictedSlopeRate;

    console.log(`Predicted rate: ${formatUnits(predictedRate, RATE_DECIMALS - 2)}%`);
    const predictedSupplyRate = (predictedRate * PREDICTIVE_UTILIZATION_RATE) / parseUnits("1", RATE_DECIMALS);

    console.log(`Predicted rate (supply): ${formatUnits(predictedSupplyRate, RATE_DECIMALS - 2)}%`);

    const blocksPerMinute = getBlockTimePerMinuteByChainId(mode.id);
    const blocksPerDay = blocksPerMinute * 60 * 24;
    const dailyRate = Math.pow(Number(formatUnits(predictedSupplyRate, RATE_DECIMALS - 2)) / 100 + 1, 1 / 365) - 1;
    const ratePerBlock = dailyRate / blocksPerDay;
    console.log("🚀 ~ PrudentiaInterestRateModel ~ getSupplyRate ~ ratePerBlock:", ratePerBlock);
    console.log(
      "🚀 ~ PrudentiaInterestRateModel ~ getSupplyRate ~ parseEther(ratePerBlock.toString()):",
      parseEther(ratePerBlock.toString())
    );
    return parseEther(ratePerBlock.toString());
  }
}
