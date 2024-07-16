/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  BNBxPriceOracle,
  BNBxPriceOracleInterface,
} from "../BNBxPriceOracle";

const _abi = [
  {
    type: "function",
    name: "BNBx",
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
  {
    type: "function",
    name: "_acceptOwner",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "_setPendingOwner",
    inputs: [
      {
        name: "newPendingOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getUnderlyingPrice",
    inputs: [
      {
        name: "cToken",
        type: "address",
        internalType: "contract ICErc20",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
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
  {
    type: "function",
    name: "pendingOwner",
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
  {
    type: "function",
    name: "price",
    inputs: [
      {
        name: "underlying",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stakeManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IStakeManager",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint8",
        indexed: false,
        internalType: "uint8",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewOwner",
    inputs: [
      {
        name: "oldOwner",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewPendingOwner",
    inputs: [
      {
        name: "oldPendingOwner",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "newPendingOwner",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610987806100206000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c8063aea9107811610071578063aea9107814610114578063e30c397814610135578063f2fde38b14610148578063f3ff4d921461015b578063fc4d33f91461016e578063fc57d4df1461017657600080fd5b80636e96dfd7146100ae578063715018a6146100c35780637542ff95146100cb5780638129fc1c146100fb5780638da5cb5b14610103575b600080fd5b6100c16100bc36600461087d565b610189565b005b6100c16101f3565b6066546100de906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b6100c161023b565b6033546001600160a01b03166100de565b61012761012236600461087d565b6103fc565b6040519081526020016100f2565b6065546100de906001600160a01b031681565b6100c161015636600461087d565b61045f565b6067546100de906001600160a01b031681565b6100c16104d0565b61012761018436600461087d565b6105e4565b6101916106ad565b606580546001600160a01b038381166001600160a01b031983168117909355604080519190921680825260208201939093527fb3d55174552271a4f1aaf36b72f50381e892171636b3fb5447fe00e995e7a37b91015b60405180910390a15050565b6101fb6106ad565b60405162461bcd60e51b815260206004820152601060248201526f6e6f74207573656420616e796d6f726560801b60448201526064015b60405180910390fd5b600054610100900460ff161580801561025b5750600054600160ff909116105b806102755750303b158015610275575060005460ff166001145b6102d85760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608401610232565b6000805460ff1916600117905580156102fb576000805461ff0019166101001790555b61030433610709565b606680546001600160a01b031916737276241a669489e4bbb76f63d2a43bfe63080f2f908117909155604080516361d1549d60e11b815290516000929163c3a2a93a9160048083019260809291908290030181865afa15801561036b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061038f919061089a565b5050606780546001600160a01b0319166001600160a01b0392909216919091179055505080156103f9576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b50565b6067546000906001600160a01b038381169116146104515760405162461bcd60e51b8152602060048201526012602482015271496e76616c696420756e6465726c79696e6760701b6044820152606401610232565b610459610741565b92915050565b6104676106ad565b606554604080516001600160a01b03928316815291831660208301527fb3d55174552271a4f1aaf36b72f50381e892171636b3fb5447fe00e995e7a37b910160405180910390a1606580546001600160a01b0319166001600160a01b0392909216919091179055565b6065546001600160a01b031633146105225760405162461bcd60e51b81526020600482015260156024820152743737ba103a3432903832b73234b7339037bbb732b960591b6044820152606401610232565b60006105366033546001600160a01b031690565b6065549091506001600160a01b031661054e816107bc565b606580546001600160a01b0319169055604080516001600160a01b0384168152600060208201527f70aea8d848e8a90fb7661b227dc522eb6395c3dac71b63cb59edd5c9899b2364910160405180910390a1606554604080516001600160a01b03808516825290921660208301527fb3d55174552271a4f1aaf36b72f50381e892171636b3fb5447fe00e995e7a37b91016101e7565b600080826001600160a01b0316636f307dc36040518163ffffffff1660e01b8152600401602060405180830381865afa158015610625573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061064991906108f9565b6067549091506001600160a01b0380831691161461069e5760405162461bcd60e51b8152602060048201526012602482015271496e76616c696420756e6465726c79696e6760701b6044820152606401610232565b6106a6610741565b9392505050565b6033546001600160a01b031633146107075760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610232565b565b600054610100900460ff166107305760405162461bcd60e51b815260040161023290610916565b61073861080e565b6103f9816107bc565b606654604051631940a0dd60e31b8152670de0b6b3a764000060048201819052600092909183916001600160a01b03169063ca0506e890602401602060405180830381865afa158015610798573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106a69190610961565b603380546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b600054610100900460ff166108355760405162461bcd60e51b815260040161023290610916565b610707600054610100900460ff1661085f5760405162461bcd60e51b815260040161023290610916565b610707336107bc565b6001600160a01b03811681146103f957600080fd5b60006020828403121561088f57600080fd5b81356106a681610868565b600080600080608085870312156108b057600080fd5b84516108bb81610868565b60208601519094506108cc81610868565b60408601519093506108dd81610868565b60608601519092506108ee81610868565b939692955090935050565b60006020828403121561090b57600080fd5b81516106a681610868565b6020808252602b908201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960408201526a6e697469616c697a696e6760a81b606082015260800190565b60006020828403121561097357600080fd5b505191905056fea164736f6c634300080a000a";

type BNBxPriceOracleConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BNBxPriceOracleConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class BNBxPriceOracle__factory extends ContractFactory {
  constructor(...args: BNBxPriceOracleConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<BNBxPriceOracle> {
    return super.deploy(overrides || {}) as Promise<BNBxPriceOracle>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): BNBxPriceOracle {
    return super.attach(address) as BNBxPriceOracle;
  }
  override connect(signer: Signer): BNBxPriceOracle__factory {
    return super.connect(signer) as BNBxPriceOracle__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BNBxPriceOracleInterface {
    return new utils.Interface(_abi) as BNBxPriceOracleInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BNBxPriceOracle {
    return new Contract(address, _abi, signerOrProvider) as BNBxPriceOracle;
  }
}