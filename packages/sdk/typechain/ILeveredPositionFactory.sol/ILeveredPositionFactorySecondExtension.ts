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

export interface ILeveredPositionFactorySecondExtensionInterface
  extends utils.Interface {
  functions: {
    "createAndFundPosition(address,address,address,uint256)": FunctionFragment;
    "createAndFundPositionAtRatio(address,address,address,uint256,uint256)": FunctionFragment;
    "createPosition(address,address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "createAndFundPosition"
      | "createAndFundPositionAtRatio"
      | "createPosition"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "createAndFundPosition",
    values: [string, string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "createAndFundPositionAtRatio",
    values: [string, string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "createPosition",
    values: [string, string]
  ): string;

  decodeFunctionResult(
    functionFragment: "createAndFundPosition",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createAndFundPositionAtRatio",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createPosition",
    data: BytesLike
  ): Result;

  events: {};
}

export interface ILeveredPositionFactorySecondExtension extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ILeveredPositionFactorySecondExtensionInterface;

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
    createAndFundPosition(
      _collateralMarket: string,
      _stableMarket: string,
      _fundingAsset: string,
      _fundingAmount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    createAndFundPositionAtRatio(
      _collateralMarket: string,
      _stableMarket: string,
      _fundingAsset: string,
      _fundingAmount: BigNumberish,
      _leverageRatio: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    createPosition(
      _collateralMarket: string,
      _stableMarket: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  createAndFundPosition(
    _collateralMarket: string,
    _stableMarket: string,
    _fundingAsset: string,
    _fundingAmount: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  createAndFundPositionAtRatio(
    _collateralMarket: string,
    _stableMarket: string,
    _fundingAsset: string,
    _fundingAmount: BigNumberish,
    _leverageRatio: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  createPosition(
    _collateralMarket: string,
    _stableMarket: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    createAndFundPosition(
      _collateralMarket: string,
      _stableMarket: string,
      _fundingAsset: string,
      _fundingAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    createAndFundPositionAtRatio(
      _collateralMarket: string,
      _stableMarket: string,
      _fundingAsset: string,
      _fundingAmount: BigNumberish,
      _leverageRatio: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    createPosition(
      _collateralMarket: string,
      _stableMarket: string,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {};

  estimateGas: {
    createAndFundPosition(
      _collateralMarket: string,
      _stableMarket: string,
      _fundingAsset: string,
      _fundingAmount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    createAndFundPositionAtRatio(
      _collateralMarket: string,
      _stableMarket: string,
      _fundingAsset: string,
      _fundingAmount: BigNumberish,
      _leverageRatio: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    createPosition(
      _collateralMarket: string,
      _stableMarket: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    createAndFundPosition(
      _collateralMarket: string,
      _stableMarket: string,
      _fundingAsset: string,
      _fundingAmount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    createAndFundPositionAtRatio(
      _collateralMarket: string,
      _stableMarket: string,
      _fundingAsset: string,
      _fundingAmount: BigNumberish,
      _leverageRatio: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    createPosition(
      _collateralMarket: string,
      _stableMarket: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}