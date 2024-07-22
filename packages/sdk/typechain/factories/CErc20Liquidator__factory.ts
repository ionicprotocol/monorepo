/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  CErc20Liquidator,
  CErc20LiquidatorInterface,
} from "../CErc20Liquidator";

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
  "0x608060405234801561001057600080fd5b5061040b806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806306fdde031461003b57806310badf4e14610076575b600080fd5b604080518082018252601081526f21a2b93199182634b8bab4b230ba37b960811b6020820152905161006d9190610271565b60405180910390f35b6100896100843660046102f4565b6100a8565b604080516001600160a01b03909316835260208301919091520161006d565b60405163db006a7560e01b8152600481018390526000908190859082906001600160a01b0383169063db006a75906024016020604051808303816000875af11580156100f8573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061011c91906103c1565b90508015610198576040805162461bcd60e51b81526020600482015260248101919091527f4572726f722063616c6c696e672072656465656d696e67207365697a6564206360448201527f45726332303a206572726f7220636f6465206e6f7420657175616c20746f2030606482015260840160405180910390fd5b816001600160a01b0316636f307dc36040518163ffffffff1660e01b8152600401602060405180830381865afa1580156101d6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101fa91906103da565b6040516370a0823160e01b81523060048201529094506001600160a01b038516906370a0823190602401602060405180830381865afa158015610241573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061026591906103c1565b92505050935093915050565b600060208083528351808285015260005b8181101561029e57858101830151858201604001528201610282565b818111156102b0576000604083870101525b50601f01601f1916929092016040019392505050565b6001600160a01b03811681146102db57600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60008060006060848603121561030957600080fd5b8335610314816102c6565b925060208401359150604084013567ffffffffffffffff8082111561033857600080fd5b818601915086601f83011261034c57600080fd5b81358181111561035e5761035e6102de565b604051601f8201601f19908116603f01168101908382118183101715610386576103866102de565b8160405282815289602084870101111561039f57600080fd5b8260208601602083013760006020848301015280955050505050509250925092565b6000602082840312156103d357600080fd5b5051919050565b6000602082840312156103ec57600080fd5b81516103f7816102c6565b939250505056fea164736f6c634300080a000a";

type CErc20LiquidatorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CErc20LiquidatorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CErc20Liquidator__factory extends ContractFactory {
  constructor(...args: CErc20LiquidatorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<CErc20Liquidator> {
    return super.deploy(overrides || {}) as Promise<CErc20Liquidator>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): CErc20Liquidator {
    return super.attach(address) as CErc20Liquidator;
  }
  override connect(signer: Signer): CErc20Liquidator__factory {
    return super.connect(signer) as CErc20Liquidator__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CErc20LiquidatorInterface {
    return new utils.Interface(_abi) as CErc20LiquidatorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CErc20Liquidator {
    return new Contract(address, _abi, signerOrProvider) as CErc20Liquidator;
  }
}
