export { default as IonicSdk } from "./IonicSdk";
export * from "./generated";

import { IonicBase } from "./IonicSdk";
import JumpRateModel from "./IonicSdk/irm/JumpRateModel";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export { filterOnlyObjectProperties } from "./IonicSdk/utils";

export type { FlywheelClaimableRewards } from "./modules/Flywheel";

export type { ChainLiquidationConfig } from "./modules/liquidation/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GConstructor<T> = new (...args: any[]) => T;
export type IonicBaseConstructor = GConstructor<IonicBase>;

export type InterestRateModelType = JumpRateModel;

export {
  BotType,
  type EncodedLiquidationTx,
  type LiquidatablePool,
  type PythLiquidatablePool,
  type ErroredPool,
  type ExtendedPoolAssetStructOutput,
  type PoolUserStruct,
  type PoolUserWithAssets,
  type PublicPoolUserWithData,
  SCALE_FACTOR_ONE_18_WEI,
  SCALE_FACTOR_UNDERLYING_DECIMALS
} from "./modules/liquidation/utils";
