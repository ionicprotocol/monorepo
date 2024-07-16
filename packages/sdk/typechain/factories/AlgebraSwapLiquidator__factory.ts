/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  AlgebraSwapLiquidator,
  AlgebraSwapLiquidatorInterface,
} from "../AlgebraSwapLiquidator";

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
  "0x608060405234801561001057600080fd5b50610408806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806306fdde031461003b57806310badf4e1461007b575b600080fd5b604080518082018252601581527420b633b2b13930a9bbb0b82634b8bab4b230ba37b960591b60208201529051610072919061022f565b60405180910390f35b61008e6100893660046102b2565b6100ad565b604080516001600160a01b039093168352602083019190915201610072565b600080600080848060200190518101906100c7919061037f565b60405163095ea7b360e01b81526001600160a01b038083166004830152602482018a90529296508694509092509088169063095ea7b3906044016020604051808303816000875af1158015610120573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061014491906103b9565b506040805160e0810182526001600160a01b03898116825284811660208301908152308385019081524260608501908152608085018c8152600060a0870181815260c08801918252975163178ca23160e31b815287518716600482015294518616602486015292518516604485015290516064840152516084830152935160a48201529251811660c484015290919083169063bc6511889060e4016020604051808303816000875af11580156101fe573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061022291906103e2565b9350505050935093915050565b600060208083528351808285015260005b8181101561025c57858101830151858201604001528201610240565b8181111561026e576000604083870101525b50601f01601f1916929092016040019392505050565b6001600160a01b038116811461029957600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b6000806000606084860312156102c757600080fd5b83356102d281610284565b925060208401359150604084013567ffffffffffffffff808211156102f657600080fd5b818601915086601f83011261030a57600080fd5b81358181111561031c5761031c61029c565b604051601f8201601f19908116603f011681019083821181831017156103445761034461029c565b8160405282815289602084870101111561035d57600080fd5b8260208601602083013760006020848301015280955050505050509250925092565b6000806040838503121561039257600080fd5b825161039d81610284565b60208401519092506103ae81610284565b809150509250929050565b6000602082840312156103cb57600080fd5b815180151581146103db57600080fd5b9392505050565b6000602082840312156103f457600080fd5b505191905056fea164736f6c634300080a000a";

type AlgebraSwapLiquidatorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: AlgebraSwapLiquidatorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class AlgebraSwapLiquidator__factory extends ContractFactory {
  constructor(...args: AlgebraSwapLiquidatorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<AlgebraSwapLiquidator> {
    return super.deploy(overrides || {}) as Promise<AlgebraSwapLiquidator>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): AlgebraSwapLiquidator {
    return super.attach(address) as AlgebraSwapLiquidator;
  }
  override connect(signer: Signer): AlgebraSwapLiquidator__factory {
    return super.connect(signer) as AlgebraSwapLiquidator__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): AlgebraSwapLiquidatorInterface {
    return new utils.Interface(_abi) as AlgebraSwapLiquidatorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AlgebraSwapLiquidator {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as AlgebraSwapLiquidator;
  }
}