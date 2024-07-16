/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  UnitrollerInterface,
  UnitrollerInterfaceInterface,
} from "../../ComptrollerInterface.sol/UnitrollerInterface";

const _abi = [
  {
    type: "function",
    name: "_acceptAdmin",
    inputs: [],
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
    name: "_setPendingAdmin",
    inputs: [
      {
        name: "newPendingAdmin",
        type: "address",
        internalType: "address",
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
    name: "_toggleAdminRights",
    inputs: [
      {
        name: "hasRights",
        type: "bool",
        internalType: "bool",
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
    name: "_upgrade",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "comptrollerImplementation",
    inputs: [],
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

export class UnitrollerInterface__factory {
  static readonly abi = _abi;
  static createInterface(): UnitrollerInterfaceInterface {
    return new utils.Interface(_abi) as UnitrollerInterfaceInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UnitrollerInterface {
    return new Contract(address, _abi, signerOrProvider) as UnitrollerInterface;
  }
}