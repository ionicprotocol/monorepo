/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IVoterProxy,
  IVoterProxyInterface,
} from "../../WombatLpERC4626.sol/IVoterProxy";

const _abi = [
  {
    type: "function",
    name: "operator",
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

export class IVoterProxy__factory {
  static readonly abi = _abi;
  static createInterface(): IVoterProxyInterface {
    return new utils.Interface(_abi) as IVoterProxyInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IVoterProxy {
    return new Contract(address, _abi, signerOrProvider) as IVoterProxy;
  }
}