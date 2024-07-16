/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IBooster,
  IBoosterInterface,
} from "../../WombatLpERC4626.sol/IBooster";

const _abi = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      {
        name: "_pid",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_stake",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "poolInfo",
    inputs: [
      {
        name: "_pid",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "lptoken",
        type: "address",
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "gauge",
        type: "address",
        internalType: "address",
      },
      {
        name: "crvRewards",
        type: "address",
        internalType: "address",
      },
      {
        name: "shutdown",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
] as const;

export class IBooster__factory {
  static readonly abi = _abi;
  static createInterface(): IBoosterInterface {
    return new utils.Interface(_abi) as IBoosterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IBooster {
    return new Contract(address, _abi, signerOrProvider) as IBooster;
  }
}