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

export interface DenominationsInterface extends utils.Interface {
  functions: {
    "ARS()": FunctionFragment;
    "AUD()": FunctionFragment;
    "BRL()": FunctionFragment;
    "BTC()": FunctionFragment;
    "CAD()": FunctionFragment;
    "CHF()": FunctionFragment;
    "CNY()": FunctionFragment;
    "ETH()": FunctionFragment;
    "EUR()": FunctionFragment;
    "GBP()": FunctionFragment;
    "INR()": FunctionFragment;
    "JPY()": FunctionFragment;
    "KRW()": FunctionFragment;
    "NGN()": FunctionFragment;
    "NZD()": FunctionFragment;
    "PHP()": FunctionFragment;
    "RUB()": FunctionFragment;
    "SGD()": FunctionFragment;
    "USD()": FunctionFragment;
    "ZAR()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "ARS"
      | "AUD"
      | "BRL"
      | "BTC"
      | "CAD"
      | "CHF"
      | "CNY"
      | "ETH"
      | "EUR"
      | "GBP"
      | "INR"
      | "JPY"
      | "KRW"
      | "NGN"
      | "NZD"
      | "PHP"
      | "RUB"
      | "SGD"
      | "USD"
      | "ZAR"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "ARS", values?: undefined): string;
  encodeFunctionData(functionFragment: "AUD", values?: undefined): string;
  encodeFunctionData(functionFragment: "BRL", values?: undefined): string;
  encodeFunctionData(functionFragment: "BTC", values?: undefined): string;
  encodeFunctionData(functionFragment: "CAD", values?: undefined): string;
  encodeFunctionData(functionFragment: "CHF", values?: undefined): string;
  encodeFunctionData(functionFragment: "CNY", values?: undefined): string;
  encodeFunctionData(functionFragment: "ETH", values?: undefined): string;
  encodeFunctionData(functionFragment: "EUR", values?: undefined): string;
  encodeFunctionData(functionFragment: "GBP", values?: undefined): string;
  encodeFunctionData(functionFragment: "INR", values?: undefined): string;
  encodeFunctionData(functionFragment: "JPY", values?: undefined): string;
  encodeFunctionData(functionFragment: "KRW", values?: undefined): string;
  encodeFunctionData(functionFragment: "NGN", values?: undefined): string;
  encodeFunctionData(functionFragment: "NZD", values?: undefined): string;
  encodeFunctionData(functionFragment: "PHP", values?: undefined): string;
  encodeFunctionData(functionFragment: "RUB", values?: undefined): string;
  encodeFunctionData(functionFragment: "SGD", values?: undefined): string;
  encodeFunctionData(functionFragment: "USD", values?: undefined): string;
  encodeFunctionData(functionFragment: "ZAR", values?: undefined): string;

  decodeFunctionResult(functionFragment: "ARS", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "AUD", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "BRL", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "BTC", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "CAD", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "CHF", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "CNY", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ETH", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "EUR", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "GBP", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "INR", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "JPY", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "KRW", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "NGN", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "NZD", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "PHP", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "RUB", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "SGD", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "USD", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ZAR", data: BytesLike): Result;

  events: {};
}

export interface Denominations extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: DenominationsInterface;

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
    ARS(overrides?: CallOverrides): Promise<[string]>;

    AUD(overrides?: CallOverrides): Promise<[string]>;

    BRL(overrides?: CallOverrides): Promise<[string]>;

    BTC(overrides?: CallOverrides): Promise<[string]>;

    CAD(overrides?: CallOverrides): Promise<[string]>;

    CHF(overrides?: CallOverrides): Promise<[string]>;

    CNY(overrides?: CallOverrides): Promise<[string]>;

    ETH(overrides?: CallOverrides): Promise<[string]>;

    EUR(overrides?: CallOverrides): Promise<[string]>;

    GBP(overrides?: CallOverrides): Promise<[string]>;

    INR(overrides?: CallOverrides): Promise<[string]>;

    JPY(overrides?: CallOverrides): Promise<[string]>;

    KRW(overrides?: CallOverrides): Promise<[string]>;

    NGN(overrides?: CallOverrides): Promise<[string]>;

    NZD(overrides?: CallOverrides): Promise<[string]>;

    PHP(overrides?: CallOverrides): Promise<[string]>;

    RUB(overrides?: CallOverrides): Promise<[string]>;

    SGD(overrides?: CallOverrides): Promise<[string]>;

    USD(overrides?: CallOverrides): Promise<[string]>;

    ZAR(overrides?: CallOverrides): Promise<[string]>;
  };

  ARS(overrides?: CallOverrides): Promise<string>;

  AUD(overrides?: CallOverrides): Promise<string>;

  BRL(overrides?: CallOverrides): Promise<string>;

  BTC(overrides?: CallOverrides): Promise<string>;

  CAD(overrides?: CallOverrides): Promise<string>;

  CHF(overrides?: CallOverrides): Promise<string>;

  CNY(overrides?: CallOverrides): Promise<string>;

  ETH(overrides?: CallOverrides): Promise<string>;

  EUR(overrides?: CallOverrides): Promise<string>;

  GBP(overrides?: CallOverrides): Promise<string>;

  INR(overrides?: CallOverrides): Promise<string>;

  JPY(overrides?: CallOverrides): Promise<string>;

  KRW(overrides?: CallOverrides): Promise<string>;

  NGN(overrides?: CallOverrides): Promise<string>;

  NZD(overrides?: CallOverrides): Promise<string>;

  PHP(overrides?: CallOverrides): Promise<string>;

  RUB(overrides?: CallOverrides): Promise<string>;

  SGD(overrides?: CallOverrides): Promise<string>;

  USD(overrides?: CallOverrides): Promise<string>;

  ZAR(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    ARS(overrides?: CallOverrides): Promise<string>;

    AUD(overrides?: CallOverrides): Promise<string>;

    BRL(overrides?: CallOverrides): Promise<string>;

    BTC(overrides?: CallOverrides): Promise<string>;

    CAD(overrides?: CallOverrides): Promise<string>;

    CHF(overrides?: CallOverrides): Promise<string>;

    CNY(overrides?: CallOverrides): Promise<string>;

    ETH(overrides?: CallOverrides): Promise<string>;

    EUR(overrides?: CallOverrides): Promise<string>;

    GBP(overrides?: CallOverrides): Promise<string>;

    INR(overrides?: CallOverrides): Promise<string>;

    JPY(overrides?: CallOverrides): Promise<string>;

    KRW(overrides?: CallOverrides): Promise<string>;

    NGN(overrides?: CallOverrides): Promise<string>;

    NZD(overrides?: CallOverrides): Promise<string>;

    PHP(overrides?: CallOverrides): Promise<string>;

    RUB(overrides?: CallOverrides): Promise<string>;

    SGD(overrides?: CallOverrides): Promise<string>;

    USD(overrides?: CallOverrides): Promise<string>;

    ZAR(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    ARS(overrides?: CallOverrides): Promise<BigNumber>;

    AUD(overrides?: CallOverrides): Promise<BigNumber>;

    BRL(overrides?: CallOverrides): Promise<BigNumber>;

    BTC(overrides?: CallOverrides): Promise<BigNumber>;

    CAD(overrides?: CallOverrides): Promise<BigNumber>;

    CHF(overrides?: CallOverrides): Promise<BigNumber>;

    CNY(overrides?: CallOverrides): Promise<BigNumber>;

    ETH(overrides?: CallOverrides): Promise<BigNumber>;

    EUR(overrides?: CallOverrides): Promise<BigNumber>;

    GBP(overrides?: CallOverrides): Promise<BigNumber>;

    INR(overrides?: CallOverrides): Promise<BigNumber>;

    JPY(overrides?: CallOverrides): Promise<BigNumber>;

    KRW(overrides?: CallOverrides): Promise<BigNumber>;

    NGN(overrides?: CallOverrides): Promise<BigNumber>;

    NZD(overrides?: CallOverrides): Promise<BigNumber>;

    PHP(overrides?: CallOverrides): Promise<BigNumber>;

    RUB(overrides?: CallOverrides): Promise<BigNumber>;

    SGD(overrides?: CallOverrides): Promise<BigNumber>;

    USD(overrides?: CallOverrides): Promise<BigNumber>;

    ZAR(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    ARS(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    AUD(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    BRL(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    BTC(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    CAD(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    CHF(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    CNY(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    ETH(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    EUR(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    GBP(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    INR(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    JPY(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    KRW(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    NGN(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    NZD(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    PHP(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    RUB(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    SGD(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    USD(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    ZAR(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
