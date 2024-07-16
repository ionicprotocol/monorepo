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

export interface IAlgebraPoolActionsInterface extends utils.Interface {
  functions: {
    "burn(int24,int24,uint128)": FunctionFragment;
    "collect(address,int24,int24,uint128,uint128)": FunctionFragment;
    "flash(address,uint256,uint256,bytes)": FunctionFragment;
    "initialize(uint160)": FunctionFragment;
    "mint(address,address,int24,int24,uint128,bytes)": FunctionFragment;
    "swap(address,bool,int256,uint160,bytes)": FunctionFragment;
    "swapSupportingFeeOnInputTokens(address,address,bool,int256,uint160,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "burn"
      | "collect"
      | "flash"
      | "initialize"
      | "mint"
      | "swap"
      | "swapSupportingFeeOnInputTokens"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "burn",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "collect",
    values: [string, BigNumberish, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "flash",
    values: [string, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [
      string,
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "swap",
    values: [string, boolean, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "swapSupportingFeeOnInputTokens",
    values: [string, string, boolean, BigNumberish, BigNumberish, BytesLike]
  ): string;

  decodeFunctionResult(functionFragment: "burn", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "collect", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "flash", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "swapSupportingFeeOnInputTokens",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IAlgebraPoolActions extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IAlgebraPoolActionsInterface;

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
    burn(
      bottomTick: BigNumberish,
      topTick: BigNumberish,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    collect(
      recipient: string,
      bottomTick: BigNumberish,
      topTick: BigNumberish,
      amount0Requested: BigNumberish,
      amount1Requested: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    flash(
      recipient: string,
      amount0: BigNumberish,
      amount1: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    initialize(
      price: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    mint(
      sender: string,
      recipient: string,
      bottomTick: BigNumberish,
      topTick: BigNumberish,
      amount: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    swap(
      recipient: string,
      zeroToOne: boolean,
      amountSpecified: BigNumberish,
      limitSqrtPrice: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    swapSupportingFeeOnInputTokens(
      sender: string,
      recipient: string,
      zeroToOne: boolean,
      amountSpecified: BigNumberish,
      limitSqrtPrice: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  burn(
    bottomTick: BigNumberish,
    topTick: BigNumberish,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  collect(
    recipient: string,
    bottomTick: BigNumberish,
    topTick: BigNumberish,
    amount0Requested: BigNumberish,
    amount1Requested: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  flash(
    recipient: string,
    amount0: BigNumberish,
    amount1: BigNumberish,
    data: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  initialize(
    price: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  mint(
    sender: string,
    recipient: string,
    bottomTick: BigNumberish,
    topTick: BigNumberish,
    amount: BigNumberish,
    data: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  swap(
    recipient: string,
    zeroToOne: boolean,
    amountSpecified: BigNumberish,
    limitSqrtPrice: BigNumberish,
    data: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  swapSupportingFeeOnInputTokens(
    sender: string,
    recipient: string,
    zeroToOne: boolean,
    amountSpecified: BigNumberish,
    limitSqrtPrice: BigNumberish,
    data: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    burn(
      bottomTick: BigNumberish,
      topTick: BigNumberish,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { amount0: BigNumber; amount1: BigNumber }
    >;

    collect(
      recipient: string,
      bottomTick: BigNumberish,
      topTick: BigNumberish,
      amount0Requested: BigNumberish,
      amount1Requested: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { amount0: BigNumber; amount1: BigNumber }
    >;

    flash(
      recipient: string,
      amount0: BigNumberish,
      amount1: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    initialize(price: BigNumberish, overrides?: CallOverrides): Promise<void>;

    mint(
      sender: string,
      recipient: string,
      bottomTick: BigNumberish,
      topTick: BigNumberish,
      amount: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        amount0: BigNumber;
        amount1: BigNumber;
        liquidityActual: BigNumber;
      }
    >;

    swap(
      recipient: string,
      zeroToOne: boolean,
      amountSpecified: BigNumberish,
      limitSqrtPrice: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { amount0: BigNumber; amount1: BigNumber }
    >;

    swapSupportingFeeOnInputTokens(
      sender: string,
      recipient: string,
      zeroToOne: boolean,
      amountSpecified: BigNumberish,
      limitSqrtPrice: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { amount0: BigNumber; amount1: BigNumber }
    >;
  };

  filters: {};

  estimateGas: {
    burn(
      bottomTick: BigNumberish,
      topTick: BigNumberish,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    collect(
      recipient: string,
      bottomTick: BigNumberish,
      topTick: BigNumberish,
      amount0Requested: BigNumberish,
      amount1Requested: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    flash(
      recipient: string,
      amount0: BigNumberish,
      amount1: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    initialize(
      price: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    mint(
      sender: string,
      recipient: string,
      bottomTick: BigNumberish,
      topTick: BigNumberish,
      amount: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    swap(
      recipient: string,
      zeroToOne: boolean,
      amountSpecified: BigNumberish,
      limitSqrtPrice: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    swapSupportingFeeOnInputTokens(
      sender: string,
      recipient: string,
      zeroToOne: boolean,
      amountSpecified: BigNumberish,
      limitSqrtPrice: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    burn(
      bottomTick: BigNumberish,
      topTick: BigNumberish,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    collect(
      recipient: string,
      bottomTick: BigNumberish,
      topTick: BigNumberish,
      amount0Requested: BigNumberish,
      amount1Requested: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    flash(
      recipient: string,
      amount0: BigNumberish,
      amount1: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    initialize(
      price: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    mint(
      sender: string,
      recipient: string,
      bottomTick: BigNumberish,
      topTick: BigNumberish,
      amount: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    swap(
      recipient: string,
      zeroToOne: boolean,
      amountSpecified: BigNumberish,
      limitSqrtPrice: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    swapSupportingFeeOnInputTokens(
      sender: string,
      recipient: string,
      zeroToOne: boolean,
      amountSpecified: BigNumberish,
      limitSqrtPrice: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
