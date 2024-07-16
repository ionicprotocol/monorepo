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
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../common";

export interface IRewardsDistributorInterface extends utils.Interface {
  functions: {
    "compAccrued(address)": FunctionFragment;
    "compBorrowSpeeds(address)": FunctionFragment;
    "compSupplySpeeds(address)": FunctionFragment;
    "flywheelPreBorrowerAction(address,address)": FunctionFragment;
    "flywheelPreSupplierAction(address,address)": FunctionFragment;
    "getAllMarkets()": FunctionFragment;
    "rewardToken()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "compAccrued"
      | "compBorrowSpeeds"
      | "compSupplySpeeds"
      | "flywheelPreBorrowerAction"
      | "flywheelPreSupplierAction"
      | "getAllMarkets"
      | "rewardToken"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "compAccrued", values: [string]): string;
  encodeFunctionData(
    functionFragment: "compBorrowSpeeds",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "compSupplySpeeds",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "flywheelPreBorrowerAction",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "flywheelPreSupplierAction",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getAllMarkets",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "rewardToken",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "compAccrued",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "compBorrowSpeeds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "compSupplySpeeds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "flywheelPreBorrowerAction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "flywheelPreSupplierAction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAllMarkets",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "rewardToken",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IRewardsDistributor extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IRewardsDistributorInterface;

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
    compAccrued(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    compBorrowSpeeds(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    compSupplySpeeds(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    flywheelPreBorrowerAction(
      cToken: string,
      borrower: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    flywheelPreSupplierAction(
      cToken: string,
      supplier: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    getAllMarkets(overrides?: CallOverrides): Promise<[string[]]>;

    rewardToken(overrides?: CallOverrides): Promise<[string]>;
  };

  compAccrued(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  compBorrowSpeeds(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  compSupplySpeeds(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  flywheelPreBorrowerAction(
    cToken: string,
    borrower: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  flywheelPreSupplierAction(
    cToken: string,
    supplier: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  getAllMarkets(overrides?: CallOverrides): Promise<string[]>;

  rewardToken(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    compAccrued(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    compBorrowSpeeds(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    compSupplySpeeds(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    flywheelPreBorrowerAction(
      cToken: string,
      borrower: string,
      overrides?: CallOverrides
    ): Promise<void>;

    flywheelPreSupplierAction(
      cToken: string,
      supplier: string,
      overrides?: CallOverrides
    ): Promise<void>;

    getAllMarkets(overrides?: CallOverrides): Promise<string[]>;

    rewardToken(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    compAccrued(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    compBorrowSpeeds(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    compSupplySpeeds(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    flywheelPreBorrowerAction(
      cToken: string,
      borrower: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    flywheelPreSupplierAction(
      cToken: string,
      supplier: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    getAllMarkets(overrides?: CallOverrides): Promise<BigNumber>;

    rewardToken(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    compAccrued(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    compBorrowSpeeds(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    compSupplySpeeds(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    flywheelPreBorrowerAction(
      cToken: string,
      borrower: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    flywheelPreSupplierAction(
      cToken: string,
      supplier: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    getAllMarkets(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    rewardToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}