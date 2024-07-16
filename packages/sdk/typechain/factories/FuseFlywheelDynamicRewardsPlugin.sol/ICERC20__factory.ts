/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ICERC20,
  ICERC20Interface,
} from "../../FuseFlywheelDynamicRewardsPlugin.sol/ICERC20";

const _abi = [
  {
    type: "function",
    name: "plugin",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
] as const;

export class ICERC20__factory {
  static readonly abi = _abi;
  static createInterface(): ICERC20Interface {
    return new utils.Interface(_abi) as ICERC20Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ICERC20 {
    return new Contract(address, _abi, signerOrProvider) as ICERC20;
  }
}