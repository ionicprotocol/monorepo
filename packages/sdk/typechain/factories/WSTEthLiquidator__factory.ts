/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  WSTEthLiquidator,
  WSTEthLiquidatorInterface,
} from "../WSTEthLiquidator";

const _abi = [
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "redeem",
    inputs: [
      {
        name: "inputToken",
        type: "address",
        internalType: "contract IERC20Upgradeable",
      },
      {
        name: "inputAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "strategyData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "outputToken",
        type: "address",
        internalType: "contract IERC20Upgradeable",
      },
      {
        name: "outputAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610321806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806306fdde031461003b57806310badf4e14610076575b600080fd5b604080518082018252601081526f2ba9aa22ba342634b8bab4b230ba37b960811b6020820152905161006d9190610187565b60405180910390f35b61008961008436600461020a565b6100a8565b604080516001600160a01b03909316835260208301919091520161006d565b604051636f074d1f60e11b815260048101839052600090819085906001600160a01b0382169063de0e9a3e906024016020604051808303816000875af11580156100f6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061011a91906102d7565b50806001600160a01b031663c1fe3e486040518163ffffffff1660e01b8152600401602060405180830381865afa158015610159573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061017d91906102f0565b9694955050505050565b600060208083528351808285015260005b818110156101b457858101830151858201604001528201610198565b818111156101c6576000604083870101525b50601f01601f1916929092016040019392505050565b6001600160a01b03811681146101f157600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60008060006060848603121561021f57600080fd5b833561022a816101dc565b925060208401359150604084013567ffffffffffffffff8082111561024e57600080fd5b818601915086601f83011261026257600080fd5b813581811115610274576102746101f4565b604051601f8201601f19908116603f0116810190838211818310171561029c5761029c6101f4565b816040528281528960208487010111156102b557600080fd5b8260208601602083013760006020848301015280955050505050509250925092565b6000602082840312156102e957600080fd5b5051919050565b60006020828403121561030257600080fd5b815161030d816101dc565b939250505056fea164736f6c634300080a000a";

type WSTEthLiquidatorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WSTEthLiquidatorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class WSTEthLiquidator__factory extends ContractFactory {
  constructor(...args: WSTEthLiquidatorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<WSTEthLiquidator> {
    return super.deploy(overrides || {}) as Promise<WSTEthLiquidator>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): WSTEthLiquidator {
    return super.attach(address) as WSTEthLiquidator;
  }
  override connect(signer: Signer): WSTEthLiquidator__factory {
    return super.connect(signer) as WSTEthLiquidator__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WSTEthLiquidatorInterface {
    return new utils.Interface(_abi) as WSTEthLiquidatorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): WSTEthLiquidator {
    return new Contract(address, _abi, signerOrProvider) as WSTEthLiquidator;
  }
}
