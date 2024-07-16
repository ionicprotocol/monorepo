/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { SOlympus, SOlympusInterface } from "../SOlympus";

const _abi = [
  {
    type: "function",
    name: "stakingContract",
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

export class SOlympus__factory {
  static readonly abi = _abi;
  static createInterface(): SOlympusInterface {
    return new utils.Interface(_abi) as SOlympusInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SOlympus {
    return new Contract(address, _abi, signerOrProvider) as SOlympus;
  }
}