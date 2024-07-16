/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
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

export interface LeveredPositionFactoryInterface extends utils.Interface {
  functions: {
    "_listExtensions()": FunctionFragment;
    "_registerExtension(address,address)": FunctionFragment;
    "_setLiquidatorsRegistry(address)": FunctionFragment;
    "_setPairWhitelisted(address,address,bool)": FunctionFragment;
    "acceptOwnership()": FunctionFragment;
    "blocksPerYear()": FunctionFragment;
    "feeDistributor()": FunctionFragment;
    "liquidatorsRegistry()": FunctionFragment;
    "owner()": FunctionFragment;
    "pendingOwner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "_listExtensions"
      | "_registerExtension"
      | "_setLiquidatorsRegistry"
      | "_setPairWhitelisted"
      | "acceptOwnership"
      | "blocksPerYear"
      | "feeDistributor"
      | "liquidatorsRegistry"
      | "owner"
      | "pendingOwner"
      | "renounceOwnership"
      | "transferOwnership"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "_listExtensions",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_registerExtension",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "_setLiquidatorsRegistry",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "_setPairWhitelisted",
    values: [string, string, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "acceptOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "blocksPerYear",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "feeDistributor",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "liquidatorsRegistry",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pendingOwner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "_listExtensions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_registerExtension",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_setLiquidatorsRegistry",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_setPairWhitelisted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "acceptOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "blocksPerYear",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "feeDistributor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "liquidatorsRegistry",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pendingOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;

  events: {
    "OwnershipTransferStarted(address,address)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferStarted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export interface OwnershipTransferStartedEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferStartedEvent = TypedEvent<
  [string, string],
  OwnershipTransferStartedEventObject
>;

export type OwnershipTransferStartedEventFilter =
  TypedEventFilter<OwnershipTransferStartedEvent>;

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

export interface LeveredPositionFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: LeveredPositionFactoryInterface;

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
    _listExtensions(overrides?: CallOverrides): Promise<[string[]]>;

    _registerExtension(
      extensionToAdd: string,
      extensionToReplace: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    _setLiquidatorsRegistry(
      _liquidatorsRegistry: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    _setPairWhitelisted(
      _collateralMarket: string,
      _stableMarket: string,
      _whitelisted: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    acceptOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    blocksPerYear(overrides?: CallOverrides): Promise<[BigNumber]>;

    feeDistributor(overrides?: CallOverrides): Promise<[string]>;

    liquidatorsRegistry(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    pendingOwner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  _listExtensions(overrides?: CallOverrides): Promise<string[]>;

  _registerExtension(
    extensionToAdd: string,
    extensionToReplace: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  _setLiquidatorsRegistry(
    _liquidatorsRegistry: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  _setPairWhitelisted(
    _collateralMarket: string,
    _stableMarket: string,
    _whitelisted: boolean,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  acceptOwnership(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  blocksPerYear(overrides?: CallOverrides): Promise<BigNumber>;

  feeDistributor(overrides?: CallOverrides): Promise<string>;

  liquidatorsRegistry(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  pendingOwner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    _listExtensions(overrides?: CallOverrides): Promise<string[]>;

    _registerExtension(
      extensionToAdd: string,
      extensionToReplace: string,
      overrides?: CallOverrides
    ): Promise<void>;

    _setLiquidatorsRegistry(
      _liquidatorsRegistry: string,
      overrides?: CallOverrides
    ): Promise<void>;

    _setPairWhitelisted(
      _collateralMarket: string,
      _stableMarket: string,
      _whitelisted: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    acceptOwnership(overrides?: CallOverrides): Promise<void>;

    blocksPerYear(overrides?: CallOverrides): Promise<BigNumber>;

    feeDistributor(overrides?: CallOverrides): Promise<string>;

    liquidatorsRegistry(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    pendingOwner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "OwnershipTransferStarted(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferStartedEventFilter;
    OwnershipTransferStarted(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferStartedEventFilter;

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
    _listExtensions(overrides?: CallOverrides): Promise<BigNumber>;

    _registerExtension(
      extensionToAdd: string,
      extensionToReplace: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    _setLiquidatorsRegistry(
      _liquidatorsRegistry: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    _setPairWhitelisted(
      _collateralMarket: string,
      _stableMarket: string,
      _whitelisted: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    acceptOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    blocksPerYear(overrides?: CallOverrides): Promise<BigNumber>;

    feeDistributor(overrides?: CallOverrides): Promise<BigNumber>;

    liquidatorsRegistry(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    pendingOwner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    _listExtensions(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    _registerExtension(
      extensionToAdd: string,
      extensionToReplace: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    _setLiquidatorsRegistry(
      _liquidatorsRegistry: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    _setPairWhitelisted(
      _collateralMarket: string,
      _stableMarket: string,
      _whitelisted: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    acceptOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    blocksPerYear(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    feeDistributor(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    liquidatorsRegistry(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pendingOwner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}