/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IUniswapV1Factory,
  IUniswapV1FactoryInterface,
} from "../IUniswapV1Factory";

const _abi = [
  {
    type: "function",
    name: "getExchange",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
] as const;

export class IUniswapV1Factory__factory {
  static readonly abi = _abi;
  static createInterface(): IUniswapV1FactoryInterface {
    return new utils.Interface(_abi) as IUniswapV1FactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IUniswapV1Factory {
    return new Contract(address, _abi, signerOrProvider) as IUniswapV1Factory;
  }
}