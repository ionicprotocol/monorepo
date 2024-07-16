/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ILeveredPositionFactoryBase,
  ILeveredPositionFactoryBaseInterface,
} from "../../ILeveredPositionFactory.sol/ILeveredPositionFactoryBase";

const _abi = [
  {
    type: "function",
    name: "_setLiquidatorsRegistry",
    inputs: [
      {
        name: "_liquidatorsRegistry",
        type: "address",
        internalType: "contract ILiquidatorsRegistry",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "_setPairWhitelisted",
    inputs: [
      {
        name: "_collateralMarket",
        type: "address",
        internalType: "contract ICErc20",
      },
      {
        name: "_stableMarket",
        type: "address",
        internalType: "contract ICErc20",
      },
      {
        name: "_whitelisted",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export class ILeveredPositionFactoryBase__factory {
  static readonly abi = _abi;
  static createInterface(): ILeveredPositionFactoryBaseInterface {
    return new utils.Interface(_abi) as ILeveredPositionFactoryBaseInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ILeveredPositionFactoryBase {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ILeveredPositionFactoryBase;
  }
}