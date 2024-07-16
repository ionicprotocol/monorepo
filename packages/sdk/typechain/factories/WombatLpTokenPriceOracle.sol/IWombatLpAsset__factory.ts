/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IWombatLpAsset,
  IWombatLpAssetInterface,
} from "../../WombatLpTokenPriceOracle.sol/IWombatLpAsset";

const _abi = [
  {
    type: "function",
    name: "cash",
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
    name: "liability",
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
    name: "pool",
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
  {
    type: "function",
    name: "totalSupply",
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
    name: "underlyingToken",
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
  {
    type: "function",
    name: "underlyingTokenBalance",
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
] as const;

export class IWombatLpAsset__factory {
  static readonly abi = _abi;
  static createInterface(): IWombatLpAssetInterface {
    return new utils.Interface(_abi) as IWombatLpAssetInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IWombatLpAsset {
    return new Contract(address, _abi, signerOrProvider) as IWombatLpAsset;
  }
}