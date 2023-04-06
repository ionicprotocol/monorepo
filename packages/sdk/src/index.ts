export { default as MidasSdk } from "./MidasSdk";
export { default as ERC20Abi } from "../abis/EIP20Interface";
export { default as WETHAbi } from "../abis/WETH";

import { MidasBase } from "./MidasSdk";
import AnkrBNBInterestRateModel from "./MidasSdk/irm/AnkrBNBInterestRateModel";
import AnkrFTMInterestRateModel from "./MidasSdk/irm/AnkrFTMInterestRateModel";
import DAIInterestRateModelV2 from "./MidasSdk/irm/DAIInterestRateModelV2";
import JumpRateModel from "./MidasSdk/irm/JumpRateModel";
import WhitePaperInterestRateModel from "./MidasSdk/irm/WhitePaperInterestRateModel";

export { filterOnlyObjectProperties } from "./MidasSdk/utils";

export type { ChainLiquidationConfig } from "./modules/liquidation/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GConstructor<T> = new (...args: any[]) => T;
export type MidasBaseConstructor = GConstructor<MidasBase>;

export type InterestRateModelType =
  | JumpRateModel
  | DAIInterestRateModelV2
  | WhitePaperInterestRateModel
  | AnkrFTMInterestRateModel
  | AnkrBNBInterestRateModel;
