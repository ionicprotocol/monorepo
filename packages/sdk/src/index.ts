export { default as IonicSdk } from "./IonicSdk";
export { default as ERC20Abi } from "../artifacts/EIP20Interface.sol/EIP20Interface.json";
export { default as WETHAbi } from "../artifacts/WETH.sol/WETH.json";

import { IonicBase } from "./IonicSdk";
import AnkrBNBInterestRateModel from "./IonicSdk/irm/AnkrBNBInterestRateModel";
import AnkrFTMInterestRateModel from "./IonicSdk/irm/AnkrFTMInterestRateModel";
import JumpRateModel from "./IonicSdk/irm/JumpRateModel";

export { filterOnlyObjectProperties } from "./IonicSdk/utils";

export type { ChainLiquidationConfig } from "./modules/liquidation/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GConstructor<T> = new (...args: any[]) => T;
export type IonicBaseConstructor = GConstructor<IonicBase>;

export type InterestRateModelType = JumpRateModel | AnkrFTMInterestRateModel | AnkrBNBInterestRateModel;
