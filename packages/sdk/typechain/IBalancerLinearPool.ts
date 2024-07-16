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
} from "./common";

export interface IBalancerLinearPoolInterface extends utils.Interface {
  functions: {
    "getActualSupply()": FunctionFragment;
    "getBptIndex()": FunctionFragment;
    "getMainToken()": FunctionFragment;
    "getPoolId()": FunctionFragment;
    "getRate()": FunctionFragment;
    "getScalingFactros()": FunctionFragment;
    "getTokenRate(address)": FunctionFragment;
    "getVault()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "getActualSupply"
      | "getBptIndex"
      | "getMainToken"
      | "getPoolId"
      | "getRate"
      | "getScalingFactros"
      | "getTokenRate"
      | "getVault"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getActualSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getBptIndex",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMainToken",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "getPoolId", values?: undefined): string;
  encodeFunctionData(functionFragment: "getRate", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getScalingFactros",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenRate",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "getVault", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "getActualSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBptIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMainToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getPoolId", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getRate", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getScalingFactros",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getVault", data: BytesLike): Result;

  events: {};
}

export interface IBalancerLinearPool extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IBalancerLinearPoolInterface;

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
    getActualSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    getBptIndex(overrides?: CallOverrides): Promise<[BigNumber]>;

    getMainToken(overrides?: CallOverrides): Promise<[string]>;

    getPoolId(overrides?: CallOverrides): Promise<[string]>;

    getRate(overrides?: CallOverrides): Promise<[BigNumber]>;

    getScalingFactros(overrides?: CallOverrides): Promise<[BigNumber[]]>;

    getTokenRate(
      token: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getVault(overrides?: CallOverrides): Promise<[string]>;
  };

  getActualSupply(overrides?: CallOverrides): Promise<BigNumber>;

  getBptIndex(overrides?: CallOverrides): Promise<BigNumber>;

  getMainToken(overrides?: CallOverrides): Promise<string>;

  getPoolId(overrides?: CallOverrides): Promise<string>;

  getRate(overrides?: CallOverrides): Promise<BigNumber>;

  getScalingFactros(overrides?: CallOverrides): Promise<BigNumber[]>;

  getTokenRate(token: string, overrides?: CallOverrides): Promise<BigNumber>;

  getVault(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    getActualSupply(overrides?: CallOverrides): Promise<BigNumber>;

    getBptIndex(overrides?: CallOverrides): Promise<BigNumber>;

    getMainToken(overrides?: CallOverrides): Promise<string>;

    getPoolId(overrides?: CallOverrides): Promise<string>;

    getRate(overrides?: CallOverrides): Promise<BigNumber>;

    getScalingFactros(overrides?: CallOverrides): Promise<BigNumber[]>;

    getTokenRate(token: string, overrides?: CallOverrides): Promise<BigNumber>;

    getVault(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    getActualSupply(overrides?: CallOverrides): Promise<BigNumber>;

    getBptIndex(overrides?: CallOverrides): Promise<BigNumber>;

    getMainToken(overrides?: CallOverrides): Promise<BigNumber>;

    getPoolId(overrides?: CallOverrides): Promise<BigNumber>;

    getRate(overrides?: CallOverrides): Promise<BigNumber>;

    getScalingFactros(overrides?: CallOverrides): Promise<BigNumber>;

    getTokenRate(token: string, overrides?: CallOverrides): Promise<BigNumber>;

    getVault(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    getActualSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getBptIndex(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getMainToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getPoolId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getRate(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getScalingFactros(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getTokenRate(
      token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getVault(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
