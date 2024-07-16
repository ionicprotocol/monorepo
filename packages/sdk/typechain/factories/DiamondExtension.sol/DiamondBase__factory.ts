/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  DiamondBase,
  DiamondBaseInterface,
} from "../../DiamondExtension.sol/DiamondBase";

const _abi = [
  {
    type: "fallback",
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "_listExtensions",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_registerExtension",
    inputs: [
      {
        name: "extensionToAdd",
        type: "address",
        internalType: "contract DiamondExtension",
      },
      {
        name: "extensionToReplace",
        type: "address",
        internalType: "contract DiamondExtension",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    name: "FunctionNotFound",
    inputs: [
      {
        name: "_functionSelector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
] as const;

export class DiamondBase__factory {
  static readonly abi = _abi;
  static createInterface(): DiamondBaseInterface {
    return new utils.Interface(_abi) as DiamondBaseInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DiamondBase {
    return new Contract(address, _abi, signerOrProvider) as DiamondBase;
  }
}