/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  UniswapV3LiquidatorFunder,
  UniswapV3LiquidatorFunderInterface,
} from "../UniswapV3LiquidatorFunder";

const _abi = [
  {
    type: "function",
    name: "convert",
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
  {
    type: "function",
    name: "estimateInputAmount",
    inputs: [
      {
        name: "outputAmount",
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
        name: "inputToken",
        type: "address",
        internalType: "contract IERC20Upgradeable",
      },
      {
        name: "inputAmount",
        type: "uint256",
        internalType: "uint256",
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
  "0x608060405234801561001057600080fd5b506105dd806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806306fdde031461005157806310badf4e1461009957806330132996146100cb57806389eabf0214610099575b600080fd5b604080518082018252601981527f556e697377617056334c697175696461746f7246756e64657200000000000000602082015290516100909190610355565b60405180910390f35b6100ac6100a7366004610465565b6100de565b604080516001600160a01b039093168352602083019190915201610090565b6100ac6100d93660046104be565b6100f8565b6000806100ec8585856101b6565b91509150935093915050565b60008060008060008086806020019051810190610115919061051d565b6040516386ed50b160e01b81526001600160a01b0380871660048301528086166024830152604482018f905262ffffff8516606483015295995093975091955090935050908216906386ed50b190608401602060405180830381865afa158015610183573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101a7919061058e565b93989397509295505050505050565b6000806000806000858060200190518101906101d2919061051d565b5060405163095ea7b360e01b81526001600160a01b038083166004830152602482018d90529399508997509195509350908a16915063095ea7b3906044016020604051808303816000875af115801561022f573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061025391906105a7565b5060408051610100810182526001600160a01b038a811682528581166020830190815262ffffff8681168486019081523060608601908152426080870190815260a087018f8152600060c0890181815260e08a01918252995163414bf38960e01b81529851881660048a0152955187166024890152925190931660448701525184166064860152905160848501525160a4840152925160c48301529151821660e48201529082169063414bf38990610104016020604051808303816000875af1158015610324573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610348919061058e565b9350505050935093915050565b600060208083528351808285015260005b8181101561038257858101830151858201604001528201610366565b81811115610394576000604083870101525b50601f01601f1916929092016040019392505050565b6001600160a01b03811681146103bf57600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126103e957600080fd5b813567ffffffffffffffff80821115610404576104046103c2565b604051601f8301601f19908116603f0116810190828211818310171561042c5761042c6103c2565b8160405283815286602085880101111561044557600080fd5b836020870160208301376000602085830101528094505050505092915050565b60008060006060848603121561047a57600080fd5b8335610485816103aa565b925060208401359150604084013567ffffffffffffffff8111156104a857600080fd5b6104b4868287016103d8565b9150509250925092565b600080604083850312156104d157600080fd5b82359150602083013567ffffffffffffffff8111156104ef57600080fd5b6104fb858286016103d8565b9150509250929050565b805162ffffff8116811461051857600080fd5b919050565b600080600080600060a0868803121561053557600080fd5b8551610540816103aa565b6020870151909550610551816103aa565b935061055f60408701610505565b9250606086015161056f816103aa565b6080870151909250610580816103aa565b809150509295509295909350565b6000602082840312156105a057600080fd5b5051919050565b6000602082840312156105b957600080fd5b815180151581146105c957600080fd5b939250505056fea164736f6c634300080a000a";

type UniswapV3LiquidatorFunderConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: UniswapV3LiquidatorFunderConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class UniswapV3LiquidatorFunder__factory extends ContractFactory {
  constructor(...args: UniswapV3LiquidatorFunderConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<UniswapV3LiquidatorFunder> {
    return super.deploy(overrides || {}) as Promise<UniswapV3LiquidatorFunder>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): UniswapV3LiquidatorFunder {
    return super.attach(address) as UniswapV3LiquidatorFunder;
  }
  override connect(signer: Signer): UniswapV3LiquidatorFunder__factory {
    return super.connect(signer) as UniswapV3LiquidatorFunder__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UniswapV3LiquidatorFunderInterface {
    return new utils.Interface(_abi) as UniswapV3LiquidatorFunderInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UniswapV3LiquidatorFunder {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as UniswapV3LiquidatorFunder;
  }
}