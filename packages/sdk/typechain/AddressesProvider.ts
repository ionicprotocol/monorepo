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

export declare namespace AddressesProvider {
  export type CurveSwapPoolStruct = { poolAddress: string; coins: string[] };

  export type CurveSwapPoolStructOutput = [string, string[]] & {
    poolAddress: string;
    coins: string[];
  };

  export type FundingStrategyStruct = {
    addr: string;
    contractInterface: string;
    inputToken: string;
  };

  export type FundingStrategyStructOutput = [string, string, string] & {
    addr: string;
    contractInterface: string;
    inputToken: string;
  };

  export type JarvisPoolStruct = {
    syntheticToken: string;
    collateralToken: string;
    liquidityPool: string;
    expirationTime: BigNumberish;
  };

  export type JarvisPoolStructOutput = [string, string, string, BigNumber] & {
    syntheticToken: string;
    collateralToken: string;
    liquidityPool: string;
    expirationTime: BigNumber;
  };

  export type RedemptionStrategyStruct = {
    addr: string;
    contractInterface: string;
    outputToken: string;
  };

  export type RedemptionStrategyStructOutput = [string, string, string] & {
    addr: string;
    contractInterface: string;
    outputToken: string;
  };
}

export interface AddressesProviderInterface extends utils.Interface {
  functions: {
    "_acceptOwner()": FunctionFragment;
    "_setPendingOwner(address)": FunctionFragment;
    "balancerPoolForTokens(address,address)": FunctionFragment;
    "curveSwapPoolsConfig(uint256)": FunctionFragment;
    "flywheelRewards(address)": FunctionFragment;
    "fundingStrategiesConfig(address)": FunctionFragment;
    "getAddress(string)": FunctionFragment;
    "getBalancerPoolForTokens(address,address)": FunctionFragment;
    "getCurveSwapPools()": FunctionFragment;
    "getFundingStrategy(address)": FunctionFragment;
    "getJarvisPools()": FunctionFragment;
    "getRedemptionStrategy(address)": FunctionFragment;
    "initialize(address)": FunctionFragment;
    "jarvisPoolsConfig(uint256)": FunctionFragment;
    "owner()": FunctionFragment;
    "pendingOwner()": FunctionFragment;
    "plugins(address)": FunctionFragment;
    "redemptionStrategiesConfig(address)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setAddress(string,address)": FunctionFragment;
    "setBalancerPoolForTokens(address,address,address)": FunctionFragment;
    "setCurveSwapPool(address,address[])": FunctionFragment;
    "setFlywheelRewards(address,address,string)": FunctionFragment;
    "setFundingStrategy(address,address,string,address)": FunctionFragment;
    "setJarvisPool(address,address,address,uint256)": FunctionFragment;
    "setPlugin(address,address,string)": FunctionFragment;
    "setRedemptionStrategy(address,address,string,address)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "_acceptOwner"
      | "_setPendingOwner"
      | "balancerPoolForTokens"
      | "curveSwapPoolsConfig"
      | "flywheelRewards"
      | "fundingStrategiesConfig"
      | "getAddress"
      | "getBalancerPoolForTokens"
      | "getCurveSwapPools"
      | "getFundingStrategy"
      | "getJarvisPools"
      | "getRedemptionStrategy"
      | "initialize"
      | "jarvisPoolsConfig"
      | "owner"
      | "pendingOwner"
      | "plugins"
      | "redemptionStrategiesConfig"
      | "renounceOwnership"
      | "setAddress"
      | "setBalancerPoolForTokens"
      | "setCurveSwapPool"
      | "setFlywheelRewards"
      | "setFundingStrategy"
      | "setJarvisPool"
      | "setPlugin"
      | "setRedemptionStrategy"
      | "transferOwnership"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "_acceptOwner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_setPendingOwner",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "balancerPoolForTokens",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "curveSwapPoolsConfig",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "flywheelRewards",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "fundingStrategiesConfig",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "getAddress", values: [string]): string;
  encodeFunctionData(
    functionFragment: "getBalancerPoolForTokens",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getCurveSwapPools",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getFundingStrategy",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getJarvisPools",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRedemptionStrategy",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "initialize", values: [string]): string;
  encodeFunctionData(
    functionFragment: "jarvisPoolsConfig",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pendingOwner",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "plugins", values: [string]): string;
  encodeFunctionData(
    functionFragment: "redemptionStrategiesConfig",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setAddress",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setBalancerPoolForTokens",
    values: [string, string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setCurveSwapPool",
    values: [string, string[]]
  ): string;
  encodeFunctionData(
    functionFragment: "setFlywheelRewards",
    values: [string, string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setFundingStrategy",
    values: [string, string, string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setJarvisPool",
    values: [string, string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setPlugin",
    values: [string, string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setRedemptionStrategy",
    values: [string, string, string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "_acceptOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_setPendingOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "balancerPoolForTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "curveSwapPoolsConfig",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "flywheelRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "fundingStrategiesConfig",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getAddress", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getBalancerPoolForTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurveSwapPools",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getFundingStrategy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getJarvisPools",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRedemptionStrategy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "jarvisPoolsConfig",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pendingOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "plugins", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "redemptionStrategiesConfig",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setAddress", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setBalancerPoolForTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setCurveSwapPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setFlywheelRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setFundingStrategy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setJarvisPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setPlugin", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setRedemptionStrategy",
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

export interface AddressesProvider extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AddressesProviderInterface;

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
    _acceptOwner(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    _setPendingOwner(
      newPendingOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    balancerPoolForTokens(
      arg0: string,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    curveSwapPoolsConfig(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string] & { poolAddress: string }>;

    flywheelRewards(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[string, string] & { addr: string; contractInterface: string }>;

    fundingStrategiesConfig(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string] & {
        addr: string;
        contractInterface: string;
        inputToken: string;
      }
    >;

    getAddress(id: string, overrides?: CallOverrides): Promise<[string]>;

    getBalancerPoolForTokens(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getCurveSwapPools(
      overrides?: CallOverrides
    ): Promise<[AddressesProvider.CurveSwapPoolStructOutput[]]>;

    getFundingStrategy(
      asset: string,
      overrides?: CallOverrides
    ): Promise<[AddressesProvider.FundingStrategyStructOutput]>;

    getJarvisPools(
      overrides?: CallOverrides
    ): Promise<[AddressesProvider.JarvisPoolStructOutput[]]>;

    getRedemptionStrategy(
      asset: string,
      overrides?: CallOverrides
    ): Promise<[AddressesProvider.RedemptionStrategyStructOutput]>;

    initialize(
      owner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    jarvisPoolsConfig(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string, BigNumber] & {
        syntheticToken: string;
        collateralToken: string;
        liquidityPool: string;
        expirationTime: BigNumber;
      }
    >;

    owner(overrides?: CallOverrides): Promise<[string]>;

    pendingOwner(overrides?: CallOverrides): Promise<[string]>;

    plugins(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[string, string] & { addr: string; contractInterface: string }>;

    redemptionStrategiesConfig(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string] & {
        addr: string;
        contractInterface: string;
        outputToken: string;
      }
    >;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setAddress(
      id: string,
      newAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setBalancerPoolForTokens(
      inputToken: string,
      outputToken: string,
      pool: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setCurveSwapPool(
      poolAddress: string,
      coins: string[],
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setFlywheelRewards(
      rewardToken: string,
      flywheelRewardsModule: string,
      contractInterface: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setFundingStrategy(
      asset: string,
      strategy: string,
      contractInterface: string,
      inputToken: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setJarvisPool(
      syntheticToken: string,
      collateralToken: string,
      liquidityPool: string,
      expirationTime: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setPlugin(
      asset: string,
      plugin: string,
      contractInterface: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setRedemptionStrategy(
      asset: string,
      strategy: string,
      contractInterface: string,
      outputToken: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  _acceptOwner(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  _setPendingOwner(
    newPendingOwner: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  balancerPoolForTokens(
    arg0: string,
    arg1: string,
    overrides?: CallOverrides
  ): Promise<string>;

  curveSwapPoolsConfig(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  flywheelRewards(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<[string, string] & { addr: string; contractInterface: string }>;

  fundingStrategiesConfig(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<
    [string, string, string] & {
      addr: string;
      contractInterface: string;
      inputToken: string;
    }
  >;

  getAddress(id: string, overrides?: CallOverrides): Promise<string>;

  getBalancerPoolForTokens(
    inputToken: string,
    outputToken: string,
    overrides?: CallOverrides
  ): Promise<string>;

  getCurveSwapPools(
    overrides?: CallOverrides
  ): Promise<AddressesProvider.CurveSwapPoolStructOutput[]>;

  getFundingStrategy(
    asset: string,
    overrides?: CallOverrides
  ): Promise<AddressesProvider.FundingStrategyStructOutput>;

  getJarvisPools(
    overrides?: CallOverrides
  ): Promise<AddressesProvider.JarvisPoolStructOutput[]>;

  getRedemptionStrategy(
    asset: string,
    overrides?: CallOverrides
  ): Promise<AddressesProvider.RedemptionStrategyStructOutput>;

  initialize(
    owner: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  jarvisPoolsConfig(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [string, string, string, BigNumber] & {
      syntheticToken: string;
      collateralToken: string;
      liquidityPool: string;
      expirationTime: BigNumber;
    }
  >;

  owner(overrides?: CallOverrides): Promise<string>;

  pendingOwner(overrides?: CallOverrides): Promise<string>;

  plugins(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<[string, string] & { addr: string; contractInterface: string }>;

  redemptionStrategiesConfig(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<
    [string, string, string] & {
      addr: string;
      contractInterface: string;
      outputToken: string;
    }
  >;

  renounceOwnership(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setAddress(
    id: string,
    newAddress: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setBalancerPoolForTokens(
    inputToken: string,
    outputToken: string,
    pool: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setCurveSwapPool(
    poolAddress: string,
    coins: string[],
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setFlywheelRewards(
    rewardToken: string,
    flywheelRewardsModule: string,
    contractInterface: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setFundingStrategy(
    asset: string,
    strategy: string,
    contractInterface: string,
    inputToken: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setJarvisPool(
    syntheticToken: string,
    collateralToken: string,
    liquidityPool: string,
    expirationTime: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setPlugin(
    asset: string,
    plugin: string,
    contractInterface: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setRedemptionStrategy(
    asset: string,
    strategy: string,
    contractInterface: string,
    outputToken: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    _acceptOwner(overrides?: CallOverrides): Promise<void>;

    _setPendingOwner(
      newPendingOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    balancerPoolForTokens(
      arg0: string,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<string>;

    curveSwapPoolsConfig(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    flywheelRewards(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[string, string] & { addr: string; contractInterface: string }>;

    fundingStrategiesConfig(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string] & {
        addr: string;
        contractInterface: string;
        inputToken: string;
      }
    >;

    getAddress(id: string, overrides?: CallOverrides): Promise<string>;

    getBalancerPoolForTokens(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<string>;

    getCurveSwapPools(
      overrides?: CallOverrides
    ): Promise<AddressesProvider.CurveSwapPoolStructOutput[]>;

    getFundingStrategy(
      asset: string,
      overrides?: CallOverrides
    ): Promise<AddressesProvider.FundingStrategyStructOutput>;

    getJarvisPools(
      overrides?: CallOverrides
    ): Promise<AddressesProvider.JarvisPoolStructOutput[]>;

    getRedemptionStrategy(
      asset: string,
      overrides?: CallOverrides
    ): Promise<AddressesProvider.RedemptionStrategyStructOutput>;

    initialize(owner: string, overrides?: CallOverrides): Promise<void>;

    jarvisPoolsConfig(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string, BigNumber] & {
        syntheticToken: string;
        collateralToken: string;
        liquidityPool: string;
        expirationTime: BigNumber;
      }
    >;

    owner(overrides?: CallOverrides): Promise<string>;

    pendingOwner(overrides?: CallOverrides): Promise<string>;

    plugins(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[string, string] & { addr: string; contractInterface: string }>;

    redemptionStrategiesConfig(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string] & {
        addr: string;
        contractInterface: string;
        outputToken: string;
      }
    >;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    setAddress(
      id: string,
      newAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setBalancerPoolForTokens(
      inputToken: string,
      outputToken: string,
      pool: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setCurveSwapPool(
      poolAddress: string,
      coins: string[],
      overrides?: CallOverrides
    ): Promise<void>;

    setFlywheelRewards(
      rewardToken: string,
      flywheelRewardsModule: string,
      contractInterface: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setFundingStrategy(
      asset: string,
      strategy: string,
      contractInterface: string,
      inputToken: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setJarvisPool(
      syntheticToken: string,
      collateralToken: string,
      liquidityPool: string,
      expirationTime: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setPlugin(
      asset: string,
      plugin: string,
      contractInterface: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setRedemptionStrategy(
      asset: string,
      strategy: string,
      contractInterface: string,
      outputToken: string,
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
    _acceptOwner(overrides?: Overrides & { from?: string }): Promise<BigNumber>;

    _setPendingOwner(
      newPendingOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    balancerPoolForTokens(
      arg0: string,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    curveSwapPoolsConfig(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    flywheelRewards(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    fundingStrategiesConfig(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAddress(id: string, overrides?: CallOverrides): Promise<BigNumber>;

    getBalancerPoolForTokens(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getCurveSwapPools(overrides?: CallOverrides): Promise<BigNumber>;

    getFundingStrategy(
      asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getJarvisPools(overrides?: CallOverrides): Promise<BigNumber>;

    getRedemptionStrategy(
      asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      owner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    jarvisPoolsConfig(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    pendingOwner(overrides?: CallOverrides): Promise<BigNumber>;

    plugins(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    redemptionStrategiesConfig(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setAddress(
      id: string,
      newAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setBalancerPoolForTokens(
      inputToken: string,
      outputToken: string,
      pool: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setCurveSwapPool(
      poolAddress: string,
      coins: string[],
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setFlywheelRewards(
      rewardToken: string,
      flywheelRewardsModule: string,
      contractInterface: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setFundingStrategy(
      asset: string,
      strategy: string,
      contractInterface: string,
      inputToken: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setJarvisPool(
      syntheticToken: string,
      collateralToken: string,
      liquidityPool: string,
      expirationTime: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setPlugin(
      asset: string,
      plugin: string,
      contractInterface: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setRedemptionStrategy(
      asset: string,
      strategy: string,
      contractInterface: string,
      outputToken: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    _acceptOwner(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    _setPendingOwner(
      newPendingOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    balancerPoolForTokens(
      arg0: string,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    curveSwapPoolsConfig(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    flywheelRewards(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    fundingStrategiesConfig(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAddress(
      id: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getBalancerPoolForTokens(
      inputToken: string,
      outputToken: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCurveSwapPools(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getFundingStrategy(
      asset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getJarvisPools(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getRedemptionStrategy(
      asset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      owner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    jarvisPoolsConfig(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pendingOwner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    plugins(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    redemptionStrategiesConfig(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setAddress(
      id: string,
      newAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setBalancerPoolForTokens(
      inputToken: string,
      outputToken: string,
      pool: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setCurveSwapPool(
      poolAddress: string,
      coins: string[],
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setFlywheelRewards(
      rewardToken: string,
      flywheelRewardsModule: string,
      contractInterface: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setFundingStrategy(
      asset: string,
      strategy: string,
      contractInterface: string,
      inputToken: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setJarvisPool(
      syntheticToken: string,
      collateralToken: string,
      liquidityPool: string,
      expirationTime: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setPlugin(
      asset: string,
      plugin: string,
      contractInterface: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setRedemptionStrategy(
      asset: string,
      strategy: string,
      contractInterface: string,
      outputToken: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
