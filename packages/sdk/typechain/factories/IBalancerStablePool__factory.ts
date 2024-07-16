/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IBalancerStablePool,
  IBalancerStablePoolInterface,
} from "../IBalancerStablePool";

const _abi = [
  {
    type: "function",
    name: "getActualSupply",
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
    name: "getBptIndex",
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
    name: "getPoolId",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRate",
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
    name: "getRateProviders",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "contract IRateProvider[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getScalingFactros",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenRate",
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
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVault",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IBalancerVault",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "updateTokenRateCache",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export class IBalancerStablePool__factory {
  static readonly abi = _abi;
  static createInterface(): IBalancerStablePoolInterface {
    return new utils.Interface(_abi) as IBalancerStablePoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IBalancerStablePool {
    return new Contract(address, _abi, signerOrProvider) as IBalancerStablePool;
  }
}