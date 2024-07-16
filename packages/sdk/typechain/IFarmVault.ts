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

export interface IFarmVaultInterface extends utils.Interface {
  functions: {
    "controller()": FunctionFragment;
    "deposit(uint256)": FunctionFragment;
    "depositFor(uint256,address)": FunctionFragment;
    "doHardWork()": FunctionFragment;
    "getPricePerFullShare()": FunctionFragment;
    "governance()": FunctionFragment;
    "setStrategy(address)": FunctionFragment;
    "setVaultFractionToInvest(uint256,uint256)": FunctionFragment;
    "strategy()": FunctionFragment;
    "underlying()": FunctionFragment;
    "underlyingBalanceInVault()": FunctionFragment;
    "underlyingBalanceWithInvestment()": FunctionFragment;
    "underlyingBalanceWithInvestmentForHolder(address)": FunctionFragment;
    "withdraw(uint256)": FunctionFragment;
    "withdrawAll()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "controller"
      | "deposit"
      | "depositFor"
      | "doHardWork"
      | "getPricePerFullShare"
      | "governance"
      | "setStrategy"
      | "setVaultFractionToInvest"
      | "strategy"
      | "underlying"
      | "underlyingBalanceInVault"
      | "underlyingBalanceWithInvestment"
      | "underlyingBalanceWithInvestmentForHolder"
      | "withdraw"
      | "withdrawAll"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "controller",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "depositFor",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "doHardWork",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getPricePerFullShare",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "governance",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "setStrategy", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setVaultFractionToInvest",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "strategy", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "underlying",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlyingBalanceInVault",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlyingBalanceWithInvestment",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlyingBalanceWithInvestmentForHolder",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawAll",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "controller", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "depositFor", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "doHardWork", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPricePerFullShare",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "governance", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setStrategy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setVaultFractionToInvest",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "strategy", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "underlying", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "underlyingBalanceInVault",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "underlyingBalanceWithInvestment",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "underlyingBalanceWithInvestmentForHolder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawAll",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IFarmVault extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IFarmVaultInterface;

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
    controller(overrides?: CallOverrides): Promise<[string]>;

    deposit(
      amountWei: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    depositFor(
      amountWei: BigNumberish,
      holder: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    doHardWork(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    getPricePerFullShare(overrides?: CallOverrides): Promise<[BigNumber]>;

    governance(overrides?: CallOverrides): Promise<[string]>;

    setStrategy(
      _strategy: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setVaultFractionToInvest(
      numerator: BigNumberish,
      denominator: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    strategy(overrides?: CallOverrides): Promise<[string]>;

    underlying(overrides?: CallOverrides): Promise<[string]>;

    underlyingBalanceInVault(overrides?: CallOverrides): Promise<[BigNumber]>;

    underlyingBalanceWithInvestment(
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    underlyingBalanceWithInvestmentForHolder(
      holder: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    withdraw(
      numberOfShares: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    withdrawAll(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  controller(overrides?: CallOverrides): Promise<string>;

  deposit(
    amountWei: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  depositFor(
    amountWei: BigNumberish,
    holder: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  doHardWork(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  getPricePerFullShare(overrides?: CallOverrides): Promise<BigNumber>;

  governance(overrides?: CallOverrides): Promise<string>;

  setStrategy(
    _strategy: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setVaultFractionToInvest(
    numerator: BigNumberish,
    denominator: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  strategy(overrides?: CallOverrides): Promise<string>;

  underlying(overrides?: CallOverrides): Promise<string>;

  underlyingBalanceInVault(overrides?: CallOverrides): Promise<BigNumber>;

  underlyingBalanceWithInvestment(
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  underlyingBalanceWithInvestmentForHolder(
    holder: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  withdraw(
    numberOfShares: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  withdrawAll(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    controller(overrides?: CallOverrides): Promise<string>;

    deposit(amountWei: BigNumberish, overrides?: CallOverrides): Promise<void>;

    depositFor(
      amountWei: BigNumberish,
      holder: string,
      overrides?: CallOverrides
    ): Promise<void>;

    doHardWork(overrides?: CallOverrides): Promise<void>;

    getPricePerFullShare(overrides?: CallOverrides): Promise<BigNumber>;

    governance(overrides?: CallOverrides): Promise<string>;

    setStrategy(_strategy: string, overrides?: CallOverrides): Promise<void>;

    setVaultFractionToInvest(
      numerator: BigNumberish,
      denominator: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    strategy(overrides?: CallOverrides): Promise<string>;

    underlying(overrides?: CallOverrides): Promise<string>;

    underlyingBalanceInVault(overrides?: CallOverrides): Promise<BigNumber>;

    underlyingBalanceWithInvestment(
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    underlyingBalanceWithInvestmentForHolder(
      holder: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdraw(
      numberOfShares: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawAll(overrides?: CallOverrides): Promise<void>;
  };

  filters: {};

  estimateGas: {
    controller(overrides?: CallOverrides): Promise<BigNumber>;

    deposit(
      amountWei: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    depositFor(
      amountWei: BigNumberish,
      holder: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    doHardWork(overrides?: Overrides & { from?: string }): Promise<BigNumber>;

    getPricePerFullShare(overrides?: CallOverrides): Promise<BigNumber>;

    governance(overrides?: CallOverrides): Promise<BigNumber>;

    setStrategy(
      _strategy: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setVaultFractionToInvest(
      numerator: BigNumberish,
      denominator: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    strategy(overrides?: CallOverrides): Promise<BigNumber>;

    underlying(overrides?: CallOverrides): Promise<BigNumber>;

    underlyingBalanceInVault(overrides?: CallOverrides): Promise<BigNumber>;

    underlyingBalanceWithInvestment(
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    underlyingBalanceWithInvestmentForHolder(
      holder: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdraw(
      numberOfShares: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    withdrawAll(overrides?: Overrides & { from?: string }): Promise<BigNumber>;
  };

  populateTransaction: {
    controller(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    deposit(
      amountWei: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    depositFor(
      amountWei: BigNumberish,
      holder: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    doHardWork(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    getPricePerFullShare(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    governance(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setStrategy(
      _strategy: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setVaultFractionToInvest(
      numerator: BigNumberish,
      denominator: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    strategy(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    underlying(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    underlyingBalanceInVault(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    underlyingBalanceWithInvestment(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    underlyingBalanceWithInvestmentForHolder(
      holder: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withdraw(
      numberOfShares: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    withdrawAll(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}