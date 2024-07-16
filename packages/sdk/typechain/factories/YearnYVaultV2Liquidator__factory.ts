/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  YearnYVaultV2Liquidator,
  YearnYVaultV2LiquidatorInterface,
} from "../YearnYVaultV2Liquidator";

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
  "0x608060405234801561001057600080fd5b50610330806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806306fdde031461003b57806310badf4e14610083575b600080fd5b604080518082018252601781527f596561726e595661756c7456324c697175696461746f720000000000000000006020820152905161007a9190610196565b60405180910390f35b610096610091366004610219565b6100b5565b604080516001600160a01b03909316835260208301919091520161007a565b604051632e1a7d4d60e01b815260048101839052600090819085906001600160a01b03821690632e1a7d4d906024016020604051808303816000875af1158015610103573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061012791906102e6565b9150806001600160a01b031663fc0c546a6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610167573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061018b91906102ff565b925050935093915050565b600060208083528351808285015260005b818110156101c3578581018301518582016040015282016101a7565b818111156101d5576000604083870101525b50601f01601f1916929092016040019392505050565b6001600160a01b038116811461020057600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60008060006060848603121561022e57600080fd5b8335610239816101eb565b925060208401359150604084013567ffffffffffffffff8082111561025d57600080fd5b818601915086601f83011261027157600080fd5b81358181111561028357610283610203565b604051601f8201601f19908116603f011681019083821181831017156102ab576102ab610203565b816040528281528960208487010111156102c457600080fd5b8260208601602083013760006020848301015280955050505050509250925092565b6000602082840312156102f857600080fd5b5051919050565b60006020828403121561031157600080fd5b815161031c816101eb565b939250505056fea164736f6c634300080a000a";

type YearnYVaultV2LiquidatorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: YearnYVaultV2LiquidatorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class YearnYVaultV2Liquidator__factory extends ContractFactory {
  constructor(...args: YearnYVaultV2LiquidatorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<YearnYVaultV2Liquidator> {
    return super.deploy(overrides || {}) as Promise<YearnYVaultV2Liquidator>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): YearnYVaultV2Liquidator {
    return super.attach(address) as YearnYVaultV2Liquidator;
  }
  override connect(signer: Signer): YearnYVaultV2Liquidator__factory {
    return super.connect(signer) as YearnYVaultV2Liquidator__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): YearnYVaultV2LiquidatorInterface {
    return new utils.Interface(_abi) as YearnYVaultV2LiquidatorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): YearnYVaultV2Liquidator {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as YearnYVaultV2Liquidator;
  }
}