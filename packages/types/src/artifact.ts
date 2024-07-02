import { Address, PublicClient } from "viem";

export type Artifact = {
  abi: Array<object>;
  bytecode: {
    object: string;
    sourceMap: string;
  };
  deployedBytecode: {
    object: string;
    sourceMap: string;
  };
};

export type MinifiedContracts = {
  [key: string]: {
    abi?: Array<object>;
    bin?: any;
  };
};

export type MinifiedCompoundContracts = {
  [key: string]: {
    abi?: Array<object>;
    bytecode?: any;
  };
};

export type MinifiedOraclesContracts = MinifiedCompoundContracts;

export interface InterestRateModel {
  init(interestRateModelAddress: Address, assetAddress: Address, client: PublicClient): Promise<void>;

  _init(
    interestRateModelAddress: Address,
    reserveFactorMantissa: bigint,
    adminFeeMantissa: bigint,
    ionicFeeMantissa: bigint,
    client: PublicClient
  ): Promise<void>;

  __init(
    baseRatePerBlock: bigint,
    multiplierPerBlock: bigint,
    jumpMultiplierPerBlock: bigint,
    kink: bigint,
    reserveFactorMantissa: bigint,
    adminFeeMantissa: bigint,
    ionicFeeMantissa: bigint
  ): Promise<void>;

  getBorrowRate(utilizationRate: bigint): bigint;

  getSupplyRate(utilizationRate: bigint): bigint;
}
