export { default as IonicSdk } from "./IonicSdk";
export { default as ERC20Abi } from "../abis/EIP20Interface";
export { default as WETHAbi } from "../abis/WETH";

import { IonicBase } from "./IonicSdk";
import AnkrBNBInterestRateModel from "./IonicSdk/irm/AnkrBNBInterestRateModel";
import AnkrFTMInterestRateModel from "./IonicSdk/irm/AnkrFTMInterestRateModel";
import DAIInterestRateModelV2 from "./IonicSdk/irm/DAIInterestRateModelV2";
import JumpRateModel from "./IonicSdk/irm/JumpRateModel";

export { filterOnlyObjectProperties } from "./IonicSdk/utils";

export type { ChainLiquidationConfig } from "./modules/liquidation/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GConstructor<T> = new (...args: any[]) => T;
export type IonicBaseConstructor = GConstructor<IonicBase>;

export type InterestRateModelType =
  | JumpRateModel
  | DAIInterestRateModelV2
  | AnkrFTMInterestRateModel
  | AnkrBNBInterestRateModel;
