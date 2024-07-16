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

export interface MockAutofarmV2Interface extends utils.Interface {
  functions: {
    "AUTO()": FunctionFragment;
    "AUTOMaxSupply()": FunctionFragment;
    "AUTOPerBlock()": FunctionFragment;
    "add(address,uint256,address)": FunctionFragment;
    "deposit(uint256,uint256)": FunctionFragment;
    "getMultiplier(uint256,uint256)": FunctionFragment;
    "poolInfo(uint256)": FunctionFragment;
    "poolLength()": FunctionFragment;
    "stakedWantTokens(uint256,address)": FunctionFragment;
    "startBlock()": FunctionFragment;
    "totalAllocPoint()": FunctionFragment;
    "updatePool(uint256)": FunctionFragment;
    "userInfo(uint256,address)": FunctionFragment;
    "withdraw(uint256,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "AUTO"
      | "AUTOMaxSupply"
      | "AUTOPerBlock"
      | "add"
      | "deposit"
      | "getMultiplier"
      | "poolInfo"
      | "poolLength"
      | "stakedWantTokens"
      | "startBlock"
      | "totalAllocPoint"
      | "updatePool"
      | "userInfo"
      | "withdraw"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "AUTO", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "AUTOMaxSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "AUTOPerBlock",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "add",
    values: [string, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getMultiplier",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "poolInfo",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "poolLength",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "stakedWantTokens",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "startBlock",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "totalAllocPoint",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "updatePool",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "userInfo",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "AUTO", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "AUTOMaxSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "AUTOPerBlock",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "add", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getMultiplier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "poolInfo", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "poolLength", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stakedWantTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "startBlock", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalAllocPoint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "updatePool", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "userInfo", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {
    "Test(uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Test"): EventFragment;
}

export interface TestEventObject {
  amount: BigNumber;
}
export type TestEvent = TypedEvent<[BigNumber], TestEventObject>;

export type TestEventFilter = TypedEventFilter<TestEvent>;

export interface MockAutofarmV2 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MockAutofarmV2Interface;

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
    AUTO(overrides?: CallOverrides): Promise<[string]>;

    AUTOMaxSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    AUTOPerBlock(overrides?: CallOverrides): Promise<[BigNumber]>;

    add(
      _want: string,
      _allocPoint: BigNumberish,
      _strat: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    deposit(
      _pid: BigNumberish,
      _wantAmt: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    getMultiplier(
      _from: BigNumberish,
      _to: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    poolInfo(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, BigNumber, string] & {
        want: string;
        allocPoint: BigNumber;
        lastRewardBlock: BigNumber;
        accAUTOPerShare: BigNumber;
        strat: string;
      }
    >;

    poolLength(overrides?: CallOverrides): Promise<[BigNumber]>;

    stakedWantTokens(
      _pid: BigNumberish,
      _user: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    startBlock(overrides?: CallOverrides): Promise<[BigNumber]>;

    totalAllocPoint(overrides?: CallOverrides): Promise<[BigNumber]>;

    updatePool(
      _pid: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    userInfo(
      arg0: BigNumberish,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { shares: BigNumber; rewardDebt: BigNumber }
    >;

    withdraw(
      _pid: BigNumberish,
      _wantAmt: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  AUTO(overrides?: CallOverrides): Promise<string>;

  AUTOMaxSupply(overrides?: CallOverrides): Promise<BigNumber>;

  AUTOPerBlock(overrides?: CallOverrides): Promise<BigNumber>;

  add(
    _want: string,
    _allocPoint: BigNumberish,
    _strat: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  deposit(
    _pid: BigNumberish,
    _wantAmt: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  getMultiplier(
    _from: BigNumberish,
    _to: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  poolInfo(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, BigNumber, BigNumber, string] & {
      want: string;
      allocPoint: BigNumber;
      lastRewardBlock: BigNumber;
      accAUTOPerShare: BigNumber;
      strat: string;
    }
  >;

  poolLength(overrides?: CallOverrides): Promise<BigNumber>;

  stakedWantTokens(
    _pid: BigNumberish,
    _user: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  startBlock(overrides?: CallOverrides): Promise<BigNumber>;

  totalAllocPoint(overrides?: CallOverrides): Promise<BigNumber>;

  updatePool(
    _pid: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  userInfo(
    arg0: BigNumberish,
    arg1: string,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { shares: BigNumber; rewardDebt: BigNumber }
  >;

  withdraw(
    _pid: BigNumberish,
    _wantAmt: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    AUTO(overrides?: CallOverrides): Promise<string>;

    AUTOMaxSupply(overrides?: CallOverrides): Promise<BigNumber>;

    AUTOPerBlock(overrides?: CallOverrides): Promise<BigNumber>;

    add(
      _want: string,
      _allocPoint: BigNumberish,
      _strat: string,
      overrides?: CallOverrides
    ): Promise<void>;

    deposit(
      _pid: BigNumberish,
      _wantAmt: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    getMultiplier(
      _from: BigNumberish,
      _to: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    poolInfo(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, BigNumber, string] & {
        want: string;
        allocPoint: BigNumber;
        lastRewardBlock: BigNumber;
        accAUTOPerShare: BigNumber;
        strat: string;
      }
    >;

    poolLength(overrides?: CallOverrides): Promise<BigNumber>;

    stakedWantTokens(
      _pid: BigNumberish,
      _user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    startBlock(overrides?: CallOverrides): Promise<BigNumber>;

    totalAllocPoint(overrides?: CallOverrides): Promise<BigNumber>;

    updatePool(_pid: BigNumberish, overrides?: CallOverrides): Promise<void>;

    userInfo(
      arg0: BigNumberish,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { shares: BigNumber; rewardDebt: BigNumber }
    >;

    withdraw(
      _pid: BigNumberish,
      _wantAmt: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "Test(uint256)"(amount?: null): TestEventFilter;
    Test(amount?: null): TestEventFilter;
  };

  estimateGas: {
    AUTO(overrides?: CallOverrides): Promise<BigNumber>;

    AUTOMaxSupply(overrides?: CallOverrides): Promise<BigNumber>;

    AUTOPerBlock(overrides?: CallOverrides): Promise<BigNumber>;

    add(
      _want: string,
      _allocPoint: BigNumberish,
      _strat: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    deposit(
      _pid: BigNumberish,
      _wantAmt: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    getMultiplier(
      _from: BigNumberish,
      _to: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    poolInfo(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    poolLength(overrides?: CallOverrides): Promise<BigNumber>;

    stakedWantTokens(
      _pid: BigNumberish,
      _user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    startBlock(overrides?: CallOverrides): Promise<BigNumber>;

    totalAllocPoint(overrides?: CallOverrides): Promise<BigNumber>;

    updatePool(
      _pid: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    userInfo(
      arg0: BigNumberish,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdraw(
      _pid: BigNumberish,
      _wantAmt: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    AUTO(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    AUTOMaxSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    AUTOPerBlock(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    add(
      _want: string,
      _allocPoint: BigNumberish,
      _strat: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    deposit(
      _pid: BigNumberish,
      _wantAmt: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    getMultiplier(
      _from: BigNumberish,
      _to: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    poolInfo(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    poolLength(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    stakedWantTokens(
      _pid: BigNumberish,
      _user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    startBlock(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalAllocPoint(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    updatePool(
      _pid: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    userInfo(
      arg0: BigNumberish,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withdraw(
      _pid: BigNumberish,
      _wantAmt: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}