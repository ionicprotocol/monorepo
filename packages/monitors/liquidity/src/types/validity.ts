import { TAssetConfig } from "./asset";

export type LiquidityInvalidity = {
  invalidReason: Failure;
  message: string;
  extraInfo?: {
    valueUSD: number;
  };
};

export type LiquidityValidity = LiquidityInvalidity | true;

export type VerifierInitError = {
  invalidReason: Failure;
  message: string;
};

export type VerifierInitValidity = VerifierInitError | null;

export enum InvalidReason {
  POOL_LIQUIDITY_BELOW_THRESHOLD = "POOL_LIQUIDITY_BELOW_THRESHOLD",
}

export enum OracleFailure {
  MPO_FAILURE = "MPO_FAILURE",
  NO_ORACLE_FOUND = "NO_ORACLE_FOUND",
}

export type Failure = InvalidReason | OracleFailure;
export enum ErrorKind {
  verification = "verification",
}

export type VerificationErrorCache = Array<{ asset: TAssetConfig; error: LiquidityInvalidity; timestamp: number }>;
