/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
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

export interface RedstoneAdapterPriceOracleInterface extends utils.Interface {
  functions: {
    "REDSTONE_ORACLE()": FunctionFragment;
    "getUnderlyingPrice(address)": FunctionFragment;
    "price(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "REDSTONE_ORACLE" | "getUnderlyingPrice" | "price"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "REDSTONE_ORACLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getUnderlyingPrice",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "price", values: [string]): string;

  decodeFunctionResult(
    functionFragment: "REDSTONE_ORACLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUnderlyingPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "price", data: BytesLike): Result;

  events: {};
}

export interface RedstoneAdapterPriceOracle extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: RedstoneAdapterPriceOracleInterface;

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
    REDSTONE_ORACLE(overrides?: CallOverrides): Promise<[string]>;

    getUnderlyingPrice(
      cToken: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    price(underlying: string, overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  REDSTONE_ORACLE(overrides?: CallOverrides): Promise<string>;

  getUnderlyingPrice(
    cToken: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  price(underlying: string, overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    REDSTONE_ORACLE(overrides?: CallOverrides): Promise<string>;

    getUnderlyingPrice(
      cToken: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    price(underlying: string, overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    REDSTONE_ORACLE(overrides?: CallOverrides): Promise<BigNumber>;

    getUnderlyingPrice(
      cToken: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    price(underlying: string, overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    REDSTONE_ORACLE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getUnderlyingPrice(
      cToken: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    price(
      underlying: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
