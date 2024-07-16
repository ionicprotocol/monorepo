/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  BalancerSwapLiquidator,
  BalancerSwapLiquidatorInterface,
} from "../BalancerSwapLiquidator";

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
  "0x608060405234801561001057600080fd5b506106d5806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806306fdde031461003b57806310badf4e1461007c575b600080fd5b60408051808201825260168152752130b630b731b2b929bbb0b82634b8bab4b230ba37b960511b602082015290516100739190610407565b60405180910390f35b61008f61008a36600461044f565b6100ae565b604080516001600160a01b039093168352602083019190915201610073565b600080600080848060200190518101906100c8919061051c565b915091506000816001600160a01b0316638d928af86040518163ffffffff1660e01b8152600401602060405180830381865afa15801561010c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101309190610556565b90506000826001600160a01b03166338fff2d06040518163ffffffff1660e01b8152600401602060405180830381865afa158015610172573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101969190610573565b905060006040518060c00160405280838152602001600060018111156101be576101be61058c565b81526020018b6001600160a01b03168152602001866001600160a01b031681526020018a815260200160405180602001604052806000815250815250905060006040518060800160405280306001600160a01b03168152602001600015158152602001306001600160a01b031681526020016000151581525090508a6001600160a01b031663095ea7b3858c6040518363ffffffff1660e01b815260040161027b9291906001600160a01b03929092168252602082015260400190565b6020604051808303816000875af115801561029a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102be91906105a2565b506001600160a01b0384166352bbbe29838360006102dd42600a6105c4565b6040518563ffffffff1660e01b81526004016102fc94939291906105ea565b6020604051808303816000875af115801561031b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061033f9190610573565b506040516370a0823160e01b81523060048201526001600160a01b038716906370a0823190602401602060405180830381865afa158015610384573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103a89190610573565b959b959a509498505050505050505050565b6000815180845260005b818110156103e0576020818501810151868301820152016103c4565b818111156103f2576000602083870101525b50601f01601f19169290920160200192915050565b60208152600061041a60208301846103ba565b9392505050565b6001600160a01b038116811461043657600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60008060006060848603121561046457600080fd5b833561046f81610421565b925060208401359150604084013567ffffffffffffffff8082111561049357600080fd5b818601915086601f8301126104a757600080fd5b8135818111156104b9576104b9610439565b604051601f8201601f19908116603f011681019083821181831017156104e1576104e1610439565b816040528281528960208487010111156104fa57600080fd5b8260208601602083013760006020848301015280955050505050509250925092565b6000806040838503121561052f57600080fd5b825161053a81610421565b602084015190925061054b81610421565b809150509250929050565b60006020828403121561056857600080fd5b815161041a81610421565b60006020828403121561058557600080fd5b5051919050565b634e487b7160e01b600052602160045260246000fd5b6000602082840312156105b457600080fd5b8151801515811461041a57600080fd5b600082198211156105e557634e487b7160e01b600052601160045260246000fd5b500190565b60e08152845160e0820152600060208601516002811061061a57634e487b7160e01b600052602160045260246000fd5b61010083015260408601516001600160a01b0316610120830152606086015161064f6101408401826001600160a01b03169052565b50608086015161016083015260a086015160c06101808401526106766101a08401826103ba565b9150506106b6602083018680516001600160a01b039081168352602080830151151590840152604080830151909116908301526060908101511515910152565b60a082019390935260c001529291505056fea164736f6c634300080a000a";

type BalancerSwapLiquidatorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BalancerSwapLiquidatorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class BalancerSwapLiquidator__factory extends ContractFactory {
  constructor(...args: BalancerSwapLiquidatorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<BalancerSwapLiquidator> {
    return super.deploy(overrides || {}) as Promise<BalancerSwapLiquidator>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): BalancerSwapLiquidator {
    return super.attach(address) as BalancerSwapLiquidator;
  }
  override connect(signer: Signer): BalancerSwapLiquidator__factory {
    return super.connect(signer) as BalancerSwapLiquidator__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BalancerSwapLiquidatorInterface {
    return new utils.Interface(_abi) as BalancerSwapLiquidatorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BalancerSwapLiquidator {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as BalancerSwapLiquidator;
  }
}