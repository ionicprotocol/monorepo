/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  SushiBarLiquidator,
  SushiBarLiquidatorInterface,
} from "../SushiBarLiquidator";

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
  "0x608060405234801561001057600080fd5b5061037d806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806306fdde031461003b57806310badf4e14610078575b600080fd5b604080518082018252601281527129bab9b434a130b92634b8bab4b230ba37b960711b6020820152905161006f91906101e3565b60405180910390f35b61008b610086366004610266565b6100aa565b604080516001600160a01b03909316835260208301919091520161006f565b6040516367dfd4c960e01b815260048101839052600090819085906001600160a01b038216906367dfd4c990602401600060405180830381600087803b1580156100f357600080fd5b505af1158015610107573d6000803e3d6000fd5b50505050806001600160a01b0316630a0879036040518163ffffffff1660e01b8152600401602060405180830381865afa158015610149573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061016d9190610333565b6040516370a0823160e01b81523060048201529093506001600160a01b038416906370a0823190602401602060405180830381865afa1580156101b4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d89190610357565b915050935093915050565b600060208083528351808285015260005b81811015610210578581018301518582016040015282016101f4565b81811115610222576000604083870101525b50601f01601f1916929092016040019392505050565b6001600160a01b038116811461024d57600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60008060006060848603121561027b57600080fd5b833561028681610238565b925060208401359150604084013567ffffffffffffffff808211156102aa57600080fd5b818601915086601f8301126102be57600080fd5b8135818111156102d0576102d0610250565b604051601f8201601f19908116603f011681019083821181831017156102f8576102f8610250565b8160405282815289602084870101111561031157600080fd5b8260208601602083013760006020848301015280955050505050509250925092565b60006020828403121561034557600080fd5b815161035081610238565b9392505050565b60006020828403121561036957600080fd5b505191905056fea164736f6c634300080a000a";

type SushiBarLiquidatorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SushiBarLiquidatorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class SushiBarLiquidator__factory extends ContractFactory {
  constructor(...args: SushiBarLiquidatorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<SushiBarLiquidator> {
    return super.deploy(overrides || {}) as Promise<SushiBarLiquidator>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): SushiBarLiquidator {
    return super.attach(address) as SushiBarLiquidator;
  }
  override connect(signer: Signer): SushiBarLiquidator__factory {
    return super.connect(signer) as SushiBarLiquidator__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SushiBarLiquidatorInterface {
    return new utils.Interface(_abi) as SushiBarLiquidatorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SushiBarLiquidator {
    return new Contract(address, _abi, signerOrProvider) as SushiBarLiquidator;
  }
}