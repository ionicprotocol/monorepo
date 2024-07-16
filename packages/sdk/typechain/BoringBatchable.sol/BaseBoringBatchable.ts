/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  PayableOverrides,
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

export interface BaseBoringBatchableInterface extends utils.Interface {
  functions: {
    "batch(bytes[],bool)": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "batch"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "batch",
    values: [BytesLike[], boolean]
  ): string;

  decodeFunctionResult(functionFragment: "batch", data: BytesLike): Result;

  events: {};
}

export interface BaseBoringBatchable extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: BaseBoringBatchableInterface;

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
    batch(
      calls: BytesLike[],
      revertOnFail: boolean,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  batch(
    calls: BytesLike[],
    revertOnFail: boolean,
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    batch(
      calls: BytesLike[],
      revertOnFail: boolean,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    batch(
      calls: BytesLike[],
      revertOnFail: boolean,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    batch(
      calls: BytesLike[],
      revertOnFail: boolean,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}