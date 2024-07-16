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
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export interface IFeeDistributorInterface extends utils.Interface {
  functions: {
    "authoritiesRegistry()": FunctionFragment;
    "canCall(address,address,address,bytes4)": FunctionFragment;
    "deployCErc20(uint8,bytes,bytes)": FunctionFragment;
    "getCErc20DelegateExtensions(address)": FunctionFragment;
    "getComptrollerExtensions(address)": FunctionFragment;
    "interestFeeRate()": FunctionFragment;
    "latestCErc20Delegate(uint8)": FunctionFragment;
    "latestComptrollerImplementation(address)": FunctionFragment;
    "latestPluginImplementation(address)": FunctionFragment;
    "maxUtilizationRate()": FunctionFragment;
    "minBorrowEth()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "authoritiesRegistry"
      | "canCall"
      | "deployCErc20"
      | "getCErc20DelegateExtensions"
      | "getComptrollerExtensions"
      | "interestFeeRate"
      | "latestCErc20Delegate"
      | "latestComptrollerImplementation"
      | "latestPluginImplementation"
      | "maxUtilizationRate"
      | "minBorrowEth"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "authoritiesRegistry",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "canCall",
    values: [string, string, string, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "deployCErc20",
    values: [BigNumberish, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getCErc20DelegateExtensions",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getComptrollerExtensions",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "interestFeeRate",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "latestCErc20Delegate",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "latestComptrollerImplementation",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "latestPluginImplementation",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "maxUtilizationRate",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "minBorrowEth",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "authoritiesRegistry",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "canCall", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "deployCErc20",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCErc20DelegateExtensions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getComptrollerExtensions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "interestFeeRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "latestCErc20Delegate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "latestComptrollerImplementation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "latestPluginImplementation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxUtilizationRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "minBorrowEth",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IFeeDistributor extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IFeeDistributorInterface;

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
    authoritiesRegistry(overrides?: CallOverrides): Promise<[string]>;

    canCall(
      pool: string,
      user: string,
      target: string,
      functionSig: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    deployCErc20(
      delegateType: BigNumberish,
      constructorData: BytesLike,
      becomeImplData: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    getCErc20DelegateExtensions(
      cErc20Delegate: string,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    getComptrollerExtensions(
      comptroller: string,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    interestFeeRate(overrides?: CallOverrides): Promise<[BigNumber]>;

    latestCErc20Delegate(
      delegateType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, string] & {
        cErc20Delegate: string;
        becomeImplementationData: string;
      }
    >;

    latestComptrollerImplementation(
      oldImplementation: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    latestPluginImplementation(
      oldImplementation: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    maxUtilizationRate(overrides?: CallOverrides): Promise<[BigNumber]>;

    minBorrowEth(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  authoritiesRegistry(overrides?: CallOverrides): Promise<string>;

  canCall(
    pool: string,
    user: string,
    target: string,
    functionSig: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  deployCErc20(
    delegateType: BigNumberish,
    constructorData: BytesLike,
    becomeImplData: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  getCErc20DelegateExtensions(
    cErc20Delegate: string,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getComptrollerExtensions(
    comptroller: string,
    overrides?: CallOverrides
  ): Promise<string[]>;

  interestFeeRate(overrides?: CallOverrides): Promise<BigNumber>;

  latestCErc20Delegate(
    delegateType: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [string, string] & {
      cErc20Delegate: string;
      becomeImplementationData: string;
    }
  >;

  latestComptrollerImplementation(
    oldImplementation: string,
    overrides?: CallOverrides
  ): Promise<string>;

  latestPluginImplementation(
    oldImplementation: string,
    overrides?: CallOverrides
  ): Promise<string>;

  maxUtilizationRate(overrides?: CallOverrides): Promise<BigNumber>;

  minBorrowEth(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    authoritiesRegistry(overrides?: CallOverrides): Promise<string>;

    canCall(
      pool: string,
      user: string,
      target: string,
      functionSig: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    deployCErc20(
      delegateType: BigNumberish,
      constructorData: BytesLike,
      becomeImplData: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    getCErc20DelegateExtensions(
      cErc20Delegate: string,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getComptrollerExtensions(
      comptroller: string,
      overrides?: CallOverrides
    ): Promise<string[]>;

    interestFeeRate(overrides?: CallOverrides): Promise<BigNumber>;

    latestCErc20Delegate(
      delegateType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, string] & {
        cErc20Delegate: string;
        becomeImplementationData: string;
      }
    >;

    latestComptrollerImplementation(
      oldImplementation: string,
      overrides?: CallOverrides
    ): Promise<string>;

    latestPluginImplementation(
      oldImplementation: string,
      overrides?: CallOverrides
    ): Promise<string>;

    maxUtilizationRate(overrides?: CallOverrides): Promise<BigNumber>;

    minBorrowEth(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    authoritiesRegistry(overrides?: CallOverrides): Promise<BigNumber>;

    canCall(
      pool: string,
      user: string,
      target: string,
      functionSig: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    deployCErc20(
      delegateType: BigNumberish,
      constructorData: BytesLike,
      becomeImplData: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    getCErc20DelegateExtensions(
      cErc20Delegate: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getComptrollerExtensions(
      comptroller: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    interestFeeRate(overrides?: CallOverrides): Promise<BigNumber>;

    latestCErc20Delegate(
      delegateType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    latestComptrollerImplementation(
      oldImplementation: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    latestPluginImplementation(
      oldImplementation: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    maxUtilizationRate(overrides?: CallOverrides): Promise<BigNumber>;

    minBorrowEth(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    authoritiesRegistry(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    canCall(
      pool: string,
      user: string,
      target: string,
      functionSig: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    deployCErc20(
      delegateType: BigNumberish,
      constructorData: BytesLike,
      becomeImplData: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    getCErc20DelegateExtensions(
      cErc20Delegate: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getComptrollerExtensions(
      comptroller: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    interestFeeRate(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    latestCErc20Delegate(
      delegateType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    latestComptrollerImplementation(
      oldImplementation: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    latestPluginImplementation(
      oldImplementation: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    maxUtilizationRate(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    minBorrowEth(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}