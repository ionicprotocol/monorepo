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
} from "../common";

export interface IMultipleRewardsInterface extends utils.Interface {
  functions: {
    "onBeamReward(uint256,address,uint256)": FunctionFragment;
    "pendingTokens(uint256,address)": FunctionFragment;
    "poolRewardsPerSec(uint256)": FunctionFragment;
    "rewardToken()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "onBeamReward"
      | "pendingTokens"
      | "poolRewardsPerSec"
      | "rewardToken"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "onBeamReward",
    values: [BigNumberish, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "pendingTokens",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "poolRewardsPerSec",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "rewardToken",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "onBeamReward",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pendingTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "poolRewardsPerSec",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "rewardToken",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IMultipleRewards extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IMultipleRewardsInterface;

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
    onBeamReward(
      pid: BigNumberish,
      user: string,
      newLpAmount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    pendingTokens(
      pid: BigNumberish,
      user: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { pending: BigNumber }>;

    poolRewardsPerSec(
      pid: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    rewardToken(overrides?: CallOverrides): Promise<[string]>;
  };

  onBeamReward(
    pid: BigNumberish,
    user: string,
    newLpAmount: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  pendingTokens(
    pid: BigNumberish,
    user: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  poolRewardsPerSec(
    pid: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  rewardToken(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    onBeamReward(
      pid: BigNumberish,
      user: string,
      newLpAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    pendingTokens(
      pid: BigNumberish,
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    poolRewardsPerSec(
      pid: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    rewardToken(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    onBeamReward(
      pid: BigNumberish,
      user: string,
      newLpAmount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    pendingTokens(
      pid: BigNumberish,
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    poolRewardsPerSec(
      pid: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    rewardToken(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    onBeamReward(
      pid: BigNumberish,
      user: string,
      newLpAmount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    pendingTokens(
      pid: BigNumberish,
      user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    poolRewardsPerSec(
      pid: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    rewardToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}