/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IStrategy, IStrategyInterface } from "../IStrategy";

const _abi = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      {
        name: "_userAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "_wantAmt",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sharesTotal",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "wantLockedTotal",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      {
        name: "_userAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "_wantAmt",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
] as const;

export class IStrategy__factory {
  static readonly abi = _abi;
  static createInterface(): IStrategyInterface {
    return new utils.Interface(_abi) as IStrategyInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IStrategy {
    return new Contract(address, _abi, signerOrProvider) as IStrategy;
  }
}