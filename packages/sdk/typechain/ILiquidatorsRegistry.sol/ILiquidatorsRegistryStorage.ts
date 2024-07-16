/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../common";

export interface ILiquidatorsRegistryStorageInterface extends utils.Interface {
  functions: {
    "customUniV3Router(address,address)": FunctionFragment;
    "defaultOutputToken(address)": FunctionFragment;
    "owner()": FunctionFragment;
    "redemptionStrategiesByName(string)": FunctionFragment;
    "redemptionStrategiesByTokens(address,address)": FunctionFragment;
    "uniswapV3Fees(address,address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "customUniV3Router"
      | "defaultOutputToken"
      | "owner"
      | "redemptionStrategiesByName"
      | "redemptionStrategiesByTokens"
      | "uniswapV3Fees"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "customUniV3Router",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "defaultOutputToken",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "redemptionStrategiesByName",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "redemptionStrategiesByTokens",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "uniswapV3Fees",
    values: [string, string]
  ): string;

  decodeFunctionResult(
    functionFragment: "customUniV3Router",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "defaultOutputToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "redemptionStrategiesByName",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "redemptionStrategiesByTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "uniswapV3Fees",
    data: BytesLike
  ): Result;

  events: {};
}

export interface ILiquidatorsRegistryStorage extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ILiquidatorsRegistryStorageInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    customUniV3Router(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    defaultOutputToken(
      inputToken: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    redemptionStrategiesByName(
      name: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    redemptionStrategiesByTokens(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    uniswapV3Fees(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<[number]>;
  };

  customUniV3Router(
    inputToken: string,
    outputToken: string,
    overrides?: CallOverrides
  ): Promise<string>;

  defaultOutputToken(
    inputToken: string,
    overrides?: CallOverrides
  ): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  redemptionStrategiesByName(
    name: string,
    overrides?: CallOverrides
  ): Promise<string>;

  redemptionStrategiesByTokens(
    inputToken: string,
    outputToken: string,
    overrides?: CallOverrides
  ): Promise<string>;

  uniswapV3Fees(
    inputToken: string,
    outputToken: string,
    overrides?: CallOverrides
  ): Promise<number>;

  callStatic: {
    customUniV3Router(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<string>;

    defaultOutputToken(
      inputToken: string,
      overrides?: CallOverrides
    ): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    redemptionStrategiesByName(
      name: string,
      overrides?: CallOverrides
    ): Promise<string>;

    redemptionStrategiesByTokens(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<string>;

    uniswapV3Fees(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<number>;
  };

  filters: {};

  estimateGas: {
    customUniV3Router(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    defaultOutputToken(
      inputToken: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    redemptionStrategiesByName(
      name: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    redemptionStrategiesByTokens(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    uniswapV3Fees(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    customUniV3Router(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    defaultOutputToken(
      inputToken: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    redemptionStrategiesByName(
      name: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    redemptionStrategiesByTokens(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    uniswapV3Fees(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}