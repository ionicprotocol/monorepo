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

export interface IAlgebraSwapCallbackInterface extends utils.Interface {
  functions: {
    "algebraSwapCallback(int256,int256,bytes)": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "algebraSwapCallback"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "algebraSwapCallback",
    values: [BigNumberish, BigNumberish, BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "algebraSwapCallback",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IAlgebraSwapCallback extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IAlgebraSwapCallbackInterface;

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
    algebraSwapCallback(
      amount0Delta: BigNumberish,
      amount1Delta: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  algebraSwapCallback(
    amount0Delta: BigNumberish,
    amount1Delta: BigNumberish,
    data: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    algebraSwapCallback(
      amount0Delta: BigNumberish,
      amount1Delta: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    algebraSwapCallback(
      amount0Delta: BigNumberish,
      amount1Delta: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    algebraSwapCallback(
      amount0Delta: BigNumberish,
      amount1Delta: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
