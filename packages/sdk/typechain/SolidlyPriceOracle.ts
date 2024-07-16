/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export declare namespace SolidlyPriceOracle {
  export type AssetConfigStruct = { poolAddress: string; baseToken: string };

  export type AssetConfigStructOutput = [string, string] & {
    poolAddress: string;
    baseToken: string;
  };
}

export interface SolidlyPriceOracleInterface extends utils.Interface {
  functions: {
    "SUPPORTED_BASE_TOKENS(uint256)": FunctionFragment;
    "WTOKEN()": FunctionFragment;
    "_acceptOwner()": FunctionFragment;
    "_setPendingOwner(address)": FunctionFragment;
    "_setSupportedBaseTokens(address[])": FunctionFragment;
    "canAdminOverwrite()": FunctionFragment;
    "getSupportedBaseTokens()": FunctionFragment;
    "getUnderlyingPrice(address)": FunctionFragment;
    "initialize(address,address[])": FunctionFragment;
    "owner()": FunctionFragment;
    "pendingOwner()": FunctionFragment;
    "poolFeeds(address)": FunctionFragment;
    "price(address)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setPoolFeeds(address[],(address,address)[])": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "SUPPORTED_BASE_TOKENS"
      | "WTOKEN"
      | "_acceptOwner"
      | "_setPendingOwner"
      | "_setSupportedBaseTokens"
      | "canAdminOverwrite"
      | "getSupportedBaseTokens"
      | "getUnderlyingPrice"
      | "initialize"
      | "owner"
      | "pendingOwner"
      | "poolFeeds"
      | "price"
      | "renounceOwnership"
      | "setPoolFeeds"
      | "transferOwnership"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "SUPPORTED_BASE_TOKENS",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "WTOKEN", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "_acceptOwner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_setPendingOwner",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "_setSupportedBaseTokens",
    values: [string[]]
  ): string;
  encodeFunctionData(
    functionFragment: "canAdminOverwrite",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getSupportedBaseTokens",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getUnderlyingPrice",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [string, string[]]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pendingOwner",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "poolFeeds", values: [string]): string;
  encodeFunctionData(functionFragment: "price", values: [string]): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setPoolFeeds",
    values: [string[], SolidlyPriceOracle.AssetConfigStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "SUPPORTED_BASE_TOKENS",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "WTOKEN", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "_acceptOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_setPendingOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_setSupportedBaseTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "canAdminOverwrite",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSupportedBaseTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUnderlyingPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pendingOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "poolFeeds", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "price", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPoolFeeds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;

  events: {
    "Initialized(uint8)": EventFragment;
    "NewOwner(address,address)": EventFragment;
    "NewPendingOwner(address,address)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewOwner"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewPendingOwner"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface NewOwnerEventObject {
  oldOwner: string;
  newOwner: string;
}
export type NewOwnerEvent = TypedEvent<[string, string], NewOwnerEventObject>;

export type NewOwnerEventFilter = TypedEventFilter<NewOwnerEvent>;

export interface NewPendingOwnerEventObject {
  oldPendingOwner: string;
  newPendingOwner: string;
}
export type NewPendingOwnerEvent = TypedEvent<
  [string, string],
  NewPendingOwnerEventObject
>;

export type NewPendingOwnerEventFilter = TypedEventFilter<NewPendingOwnerEvent>;

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface SolidlyPriceOracle extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: SolidlyPriceOracleInterface;

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
    SUPPORTED_BASE_TOKENS(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    WTOKEN(overrides?: CallOverrides): Promise<[string]>;

    _acceptOwner(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    _setPendingOwner(
      newPendingOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    _setSupportedBaseTokens(
      _supportedBaseTokens: string[],
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    canAdminOverwrite(overrides?: CallOverrides): Promise<[boolean]>;

    getSupportedBaseTokens(overrides?: CallOverrides): Promise<[string[]]>;

    getUnderlyingPrice(
      cToken: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    initialize(
      _wtoken: string,
      _supportedBaseTokens: string[],
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    pendingOwner(overrides?: CallOverrides): Promise<[string]>;

    poolFeeds(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[string, string] & { poolAddress: string; baseToken: string }>;

    price(underlying: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setPoolFeeds(
      underlyings: string[],
      assetConfig: SolidlyPriceOracle.AssetConfigStruct[],
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  SUPPORTED_BASE_TOKENS(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  WTOKEN(overrides?: CallOverrides): Promise<string>;

  _acceptOwner(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  _setPendingOwner(
    newPendingOwner: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  _setSupportedBaseTokens(
    _supportedBaseTokens: string[],
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  canAdminOverwrite(overrides?: CallOverrides): Promise<boolean>;

  getSupportedBaseTokens(overrides?: CallOverrides): Promise<string[]>;

  getUnderlyingPrice(
    cToken: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  initialize(
    _wtoken: string,
    _supportedBaseTokens: string[],
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  pendingOwner(overrides?: CallOverrides): Promise<string>;

  poolFeeds(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<[string, string] & { poolAddress: string; baseToken: string }>;

  price(underlying: string, overrides?: CallOverrides): Promise<BigNumber>;

  renounceOwnership(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setPoolFeeds(
    underlyings: string[],
    assetConfig: SolidlyPriceOracle.AssetConfigStruct[],
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    SUPPORTED_BASE_TOKENS(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    WTOKEN(overrides?: CallOverrides): Promise<string>;

    _acceptOwner(overrides?: CallOverrides): Promise<void>;

    _setPendingOwner(
      newPendingOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    _setSupportedBaseTokens(
      _supportedBaseTokens: string[],
      overrides?: CallOverrides
    ): Promise<void>;

    canAdminOverwrite(overrides?: CallOverrides): Promise<boolean>;

    getSupportedBaseTokens(overrides?: CallOverrides): Promise<string[]>;

    getUnderlyingPrice(
      cToken: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      _wtoken: string,
      _supportedBaseTokens: string[],
      overrides?: CallOverrides
    ): Promise<void>;

    owner(overrides?: CallOverrides): Promise<string>;

    pendingOwner(overrides?: CallOverrides): Promise<string>;

    poolFeeds(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[string, string] & { poolAddress: string; baseToken: string }>;

    price(underlying: string, overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    setPoolFeeds(
      underlyings: string[],
      assetConfig: SolidlyPriceOracle.AssetConfigStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "NewOwner(address,address)"(
      oldOwner?: null,
      newOwner?: null
    ): NewOwnerEventFilter;
    NewOwner(oldOwner?: null, newOwner?: null): NewOwnerEventFilter;

    "NewPendingOwner(address,address)"(
      oldPendingOwner?: null,
      newPendingOwner?: null
    ): NewPendingOwnerEventFilter;
    NewPendingOwner(
      oldPendingOwner?: null,
      newPendingOwner?: null
    ): NewPendingOwnerEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
  };

  estimateGas: {
    SUPPORTED_BASE_TOKENS(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    WTOKEN(overrides?: CallOverrides): Promise<BigNumber>;

    _acceptOwner(overrides?: Overrides & { from?: string }): Promise<BigNumber>;

    _setPendingOwner(
      newPendingOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    _setSupportedBaseTokens(
      _supportedBaseTokens: string[],
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    canAdminOverwrite(overrides?: CallOverrides): Promise<BigNumber>;

    getSupportedBaseTokens(overrides?: CallOverrides): Promise<BigNumber>;

    getUnderlyingPrice(
      cToken: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      _wtoken: string,
      _supportedBaseTokens: string[],
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    pendingOwner(overrides?: CallOverrides): Promise<BigNumber>;

    poolFeeds(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    price(underlying: string, overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setPoolFeeds(
      underlyings: string[],
      assetConfig: SolidlyPriceOracle.AssetConfigStruct[],
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    SUPPORTED_BASE_TOKENS(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    WTOKEN(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    _acceptOwner(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    _setPendingOwner(
      newPendingOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    _setSupportedBaseTokens(
      _supportedBaseTokens: string[],
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    canAdminOverwrite(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getSupportedBaseTokens(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getUnderlyingPrice(
      cToken: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      _wtoken: string,
      _supportedBaseTokens: string[],
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pendingOwner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    poolFeeds(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    price(
      underlying: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setPoolFeeds(
      underlyings: string[],
      assetConfig: SolidlyPriceOracle.AssetConfigStruct[],
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}