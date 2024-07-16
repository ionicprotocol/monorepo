/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  WombatLpTokenLiquidator,
  WombatLpTokenLiquidatorInterface,
} from "../../WombatLpTokenLiquidator.sol/WombatLpTokenLiquidator";

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
  "0x608060405234801561001057600080fd5b506107df806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806306fdde031461003b57806310badf4e14610083575b600080fd5b604080518082018252601781527f576f6d6261744c70546f6b656e4c697175696461746f720000000000000000006020820152905161007a919061060c565b60405180910390f35b61009661009136600461066d565b6100b5565b604080516001600160a01b03909316835260208301919091520161007a565b6000806100c38585856100cf565b91509150935093915050565b600080600080848060200190518101906100e9919061073a565b915091506100f887838861018b565b6040516309a5fca360e01b81526001600160a01b03828116600483015260248201889052600060448301523060648301524260848301528316906309a5fca39060a4016020604051808303816000875af115801561015a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061017e9190610774565b9097909650945050505050565b604051636eb1769f60e11b81523060048201526001600160a01b0383811660248301526000919085169063dd62ed3e90604401602060405180830381865afa1580156101db573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101ff9190610774565b90508181101561023a578015610224576102246001600160a01b038516846000610240565b61023a6001600160a01b03851684600019610240565b50505050565b8015806102ba5750604051636eb1769f60e11b81523060048201526001600160a01b03838116602483015284169063dd62ed3e90604401602060405180830381865afa158015610294573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102b89190610774565b155b61032a5760405162461bcd60e51b815260206004820152603660248201527f5361666545524332303a20617070726f76652066726f6d206e6f6e2d7a65726f60448201527520746f206e6f6e2d7a65726f20616c6c6f77616e636560501b60648201526084015b60405180910390fd5b604080516001600160a01b038416602482015260448082018490528251808303909101815260649091019091526020810180516001600160e01b031663095ea7b360e01b17905261037c908490610381565b505050565b60006103d6826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b03166104539092919063ffffffff16565b80519091501561037c57808060200190518101906103f4919061078d565b61037c5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b6064820152608401610321565b6060610462848460008561046a565b949350505050565b6060824710156104cb5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b6064820152608401610321565b600080866001600160a01b031685876040516104e791906107b6565b60006040518083038185875af1925050503d8060008114610524576040519150601f19603f3d011682016040523d82523d6000602084013e610529565b606091505b509150915061053a87838387610545565b979650505050505050565b606083156105b15782516105aa576001600160a01b0385163b6105aa5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610321565b5081610462565b61046283838151156105c65781518083602001fd5b8060405162461bcd60e51b8152600401610321919061060c565b60005b838110156105fb5781810151838201526020016105e3565b8381111561023a5750506000910152565b602081526000825180602084015261062b8160408501602087016105e0565b601f01601f19169190910160400192915050565b6001600160a01b038116811461065457600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60008060006060848603121561068257600080fd5b833561068d8161063f565b925060208401359150604084013567ffffffffffffffff808211156106b157600080fd5b818601915086601f8301126106c557600080fd5b8135818111156106d7576106d7610657565b604051601f8201601f19908116603f011681019083821181831017156106ff576106ff610657565b8160405282815289602084870101111561071857600080fd5b8260208601602083013760006020848301015280955050505050509250925092565b6000806040838503121561074d57600080fd5b82516107588161063f565b60208401519092506107698161063f565b809150509250929050565b60006020828403121561078657600080fd5b5051919050565b60006020828403121561079f57600080fd5b815180151581146107af57600080fd5b9392505050565b600082516107c88184602087016105e0565b919091019291505056fea164736f6c634300080a000a";

type WombatLpTokenLiquidatorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WombatLpTokenLiquidatorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class WombatLpTokenLiquidator__factory extends ContractFactory {
  constructor(...args: WombatLpTokenLiquidatorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<WombatLpTokenLiquidator> {
    return super.deploy(overrides || {}) as Promise<WombatLpTokenLiquidator>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): WombatLpTokenLiquidator {
    return super.attach(address) as WombatLpTokenLiquidator;
  }
  override connect(signer: Signer): WombatLpTokenLiquidator__factory {
    return super.connect(signer) as WombatLpTokenLiquidator__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WombatLpTokenLiquidatorInterface {
    return new utils.Interface(_abi) as WombatLpTokenLiquidatorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): WombatLpTokenLiquidator {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as WombatLpTokenLiquidator;
  }
}