/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  MStableLiquidator,
  MStableLiquidatorInterface,
} from "../MStableLiquidator";

const _abi = [
  {
    type: "function",
    name: "IMBTC",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ISavingsContractV2",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "IMUSD",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ISavingsContractV2",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MBTC",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IMasset",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MUSD",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IMasset",
      },
    ],
    stateMutability: "view",
  },
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
  "0x608060405234801561001057600080fd5b506107f2806100206000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c806306fdde031461006757806310badf4e146100a357806343a82621146100d55780635685c38714610108578063cb5690e514610123578063f35d2ab61461013e575b600080fd5b604080518082018252601181527026a9ba30b13632a634b8bab4b230ba37b960791b6020820152905161009a91906105c4565b60405180910390f35b6100b66100b1366004610647565b610159565b604080516001600160a01b03909316835260208301919091520161009a565b6100f073e2f2a5c287993345a840db3b0845fbc70f5935a581565b6040516001600160a01b03909116815260200161009a565b6100f07317d8cbb6bce8cee970a4027d1198f6700a7a6c2481565b6100f073945facb997494cc2570096c74b5f66a3507330a181565b6100f07330647a72dc82d7fbb1123ea74716ab8a317eac1981565b60008060008351111561017d578280602001905181019061017a9190610714565b91505b6001600160a01b03851673e2f2a5c287993345a840db3b0845fbc70f5935a51415610250576001600160a01b0382166101c85773a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4891505b6040516321de7d5b60e11b815273e2f2a5c287993345a840db3b0845fbc70f5935a5906343bcfab69061020690859088906001903090600401610738565b6020604051808303816000875af1158015610225573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102499190610763565b90506105bc565b6001600160a01b0385167330647a72dc82d7fbb1123ea74716ab8a317eac1914156103c85760405163c9f18ebd60e01b8152600481018590526000907330647a72dc82d7fbb1123ea74716ab8a317eac199063c9f18ebd906024016020604051808303816000875af11580156102ca573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102ee9190610763565b9050600081116103195760405162461bcd60e51b81526004016103109061077c565b60405180910390fd5b6001600160a01b03831661033f5773a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4892505b6040516321de7d5b60e11b815273e2f2a5c287993345a840db3b0845fbc70f5935a5906343bcfab69061037d90869085906001903090600401610738565b6020604051808303816000875af115801561039c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103c09190610763565b9150506105bc565b6001600160a01b03851673945facb997494cc2570096c74b5f66a3507330a11415610451576001600160a01b03821661041357732260fac5e5542a773aa44fbcfedf7c193bc2c59991505b6040516321de7d5b60e11b815273945facb997494cc2570096c74b5f66a3507330a1906343bcfab69061020690859088906001903090600401610738565b6001600160a01b0385167317d8cbb6bce8cee970a4027d1198f6700a7a6c2414156105bc5760405163c9f18ebd60e01b8152600481018590526000907317d8cbb6bce8cee970a4027d1198f6700a7a6c249063c9f18ebd906024016020604051808303816000875af11580156104cb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104ef9190610763565b9050600081116105115760405162461bcd60e51b81526004016103109061077c565b6001600160a01b03831661053757732260fac5e5542a773aa44fbcfedf7c193bc2c59992505b6040516321de7d5b60e11b815273945facb997494cc2570096c74b5f66a3507330a1906343bcfab69061057590869085906001903090600401610738565b6020604051808303816000875af1158015610594573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105b89190610763565b9150505b935093915050565b600060208083528351808285015260005b818110156105f1578581018301518582016040015282016105d5565b81811115610603576000604083870101525b50601f01601f1916929092016040019392505050565b6001600160a01b038116811461062e57600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60008060006060848603121561065c57600080fd5b833561066781610619565b925060208401359150604084013567ffffffffffffffff8082111561068b57600080fd5b818601915086601f83011261069f57600080fd5b8135818111156106b1576106b1610631565b604051601f8201601f19908116603f011681019083821181831017156106d9576106d9610631565b816040528281528960208487010111156106f257600080fd5b8260208601602083013760006020848301015280955050505050509250925092565b60006020828403121561072657600080fd5b815161073181610619565b9392505050565b6001600160a01b03948516815260208101939093526040830191909152909116606082015260800190565b60006020828403121561077557600080fd5b5051919050565b60208082526043908201527f4572726f722063616c6c696e672072656465656d206f6e206d537461626c652060408201527f736176696e677320636f6e74726163743a206e6f206d5553442072657475726e60608201526232b21760e91b608082015260a0019056fea164736f6c634300080a000a";

type MStableLiquidatorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MStableLiquidatorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MStableLiquidator__factory extends ContractFactory {
  constructor(...args: MStableLiquidatorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<MStableLiquidator> {
    return super.deploy(overrides || {}) as Promise<MStableLiquidator>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): MStableLiquidator {
    return super.attach(address) as MStableLiquidator;
  }
  override connect(signer: Signer): MStableLiquidator__factory {
    return super.connect(signer) as MStableLiquidator__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MStableLiquidatorInterface {
    return new utils.Interface(_abi) as MStableLiquidatorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MStableLiquidator {
    return new Contract(address, _abi, signerOrProvider) as MStableLiquidator;
  }
}