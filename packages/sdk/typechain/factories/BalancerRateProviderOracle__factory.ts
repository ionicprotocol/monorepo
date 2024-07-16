/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  BalancerRateProviderOracle,
  BalancerRateProviderOracleInterface,
} from "../BalancerRateProviderOracle";

const _abi = [
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
    name: "baseTokens",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
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
    name: "getAllUnderlyings",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
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
    inputs: [
      {
        name: "_rateProviders",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "_baseTokens",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "_underlyings",
        type: "address[]",
        internalType: "address[]",
      },
    ],
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
    name: "rateProviders",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IRateProvider",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "registerToken",
    inputs: [
      {
        name: "_rateProvider",
        type: "address",
        internalType: "address",
      },
      {
        name: "_baseToken",
        type: "address",
        internalType: "address",
      },
      {
        name: "_underlying",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
    type: "function",
    name: "underlyings",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
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
  "0x608060405234801561001057600080fd5b50611151806100206000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c8063aea910781161008c578063e30c397811610066578063e30c3978146101fb578063f2fde38b1461020e578063fc4d33f914610221578063fc57d4df1461022957600080fd5b8063aea91078146101b2578063c3f80bc4146101d3578063cea0252e146101e857600080fd5b80636e96dfd7116100c85780636e96dfd714610173578063708019c414610186578063715018a6146101995780638da5cb5b146101a157600080fd5b806302eba094146100ef57806319e4d3a314610135578063435356d11461015e575b600080fd5b6101186100fd366004610d1a565b6067602052600090815260409020546001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b610118610143366004610d1a565b6066602052600090815260409020546001600160a01b031681565b61017161016c366004610def565b61023c565b005b610171610181366004610d1a565b6104e0565b610171610194366004610e77565b61054a565b61017161064f565b6033546001600160a01b0316610118565b6101c56101c0366004610d1a565b610692565b60405190815260200161012c565b6101db6106a3565b60405161012c9190610ec2565b6101186101f6366004610f0f565b610705565b606554610118906001600160a01b031681565b61017161021c366004610d1a565b61072f565b6101716107a0565b6101c5610237366004610d1a565b6108b4565b600054610100900460ff161580801561025c5750600054600160ff909116105b806102765750303b158015610276575060005460ff166001145b6102de5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b60648201526084015b60405180910390fd5b6000805460ff191660011790558015610301576000805461ff0019166101001790555b61030a336109b7565b8251845114801561031c575081518351145b6103685760405162461bcd60e51b815260206004820152601860248201527f4172726179206c656e67746873206e6f7420657175616c2e000000000000000060448201526064016102d5565b815161037b906068906020850190610c7b565b5060005b84518110156104935784818151811061039a5761039a610f28565b6020026020010151606660008584815181106103b8576103b8610f28565b60200260200101516001600160a01b03166001600160a01b0316815260200190815260200160002060006101000a8154816001600160a01b0302191690836001600160a01b0316021790555083818151811061041657610416610f28565b60200260200101516067600085848151811061043457610434610f28565b60200260200101516001600160a01b03166001600160a01b0316815260200190815260200160002060006101000a8154816001600160a01b0302191690836001600160a01b03160217905550808061048b90610f54565b91505061037f565b5080156104da576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b50505050565b6104e86109f2565b606580546001600160a01b038381166001600160a01b031983168117909355604080519190921680825260208201939093527fb3d55174552271a4f1aaf36b72f50381e892171636b3fb5447fe00e995e7a37b91015b60405180910390a15050565b6105526109f2565b6000805b6068548110156105b357826001600160a01b03166068828154811061057d5761057d610f28565b6000918252602090912001546001600160a01b031614156105a157600191506105b3565b806105ab81610f54565b915050610556565b508061060557606880546001810182556000919091527fa2153420d844928b4421650203c77babc8b33d7f2e7b450e2966db0c220977530180546001600160a01b0319166001600160a01b0384161790555b506001600160a01b03908116600090815260676020908152604080832080549585166001600160a01b03199687161790556066909152902080549390911692909116919091179055565b6106576109f2565b60405162461bcd60e51b815260206004820152601060248201526f6e6f74207573656420616e796d6f726560801b60448201526064016102d5565b600061069d82610a4e565b92915050565b606060688054806020026020016040519081016040528092919081815260200182805480156106fb57602002820191906000526020600020905b81546001600160a01b031681526001909101906020018083116106dd575b5050505050905090565b6068818154811061071557600080fd5b6000918252602090912001546001600160a01b0316905081565b6107376109f2565b606554604080516001600160a01b03928316815291831660208301527fb3d55174552271a4f1aaf36b72f50381e892171636b3fb5447fe00e995e7a37b910160405180910390a1606580546001600160a01b0319166001600160a01b0392909216919091179055565b6065546001600160a01b031633146107f25760405162461bcd60e51b81526020600482015260156024820152743737ba103a3432903832b73234b7339037bbb732b960591b60448201526064016102d5565b60006108066033546001600160a01b031690565b6065549091506001600160a01b031661081e81610bcf565b606580546001600160a01b0319169055604080516001600160a01b0384168152600060208201527f70aea8d848e8a90fb7661b227dc522eb6395c3dac71b63cb59edd5c9899b2364910160405180910390a1606554604080516001600160a01b03808516825290921660208301527fb3d55174552271a4f1aaf36b72f50381e892171636b3fb5447fe00e995e7a37b910161053e565b600080826001600160a01b0316636f307dc36040518163ffffffff1660e01b8152600401602060405180830381865afa1580156108f5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109199190610f6f565b9050806001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610959573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061097d9190610f8c565b61098b9060ff16600a611093565b61099482610a4e565b6109a690670de0b6b3a764000061109f565b6109b091906110be565b9392505050565b600054610100900460ff166109de5760405162461bcd60e51b81526004016102d5906110e0565b6109e6610c21565b6109ef81610bcf565b50565b6033546001600160a01b03163314610a4c5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016102d5565b565b6001600160a01b03818116600090815260676020526040812054909116610ab05760405162461bcd60e51b8152602060048201526016602482015275556e737570706f7274656420756e6465726c79696e6760501b60448201526064016102d5565b6001600160a01b0380831660009081526066602090815260408083205481516333cd77e760e11b815291519394169263679aefce926004808401939192918290030181865afa158015610b07573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b2b919061112b565b6001600160a01b038481166000908152606760205260408082205490516315d5220f60e31b815292166004830152919250339063aea9107890602401602060405180830381865afa158015610b84573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ba8919061112b565b9050670de0b6b3a7640000610bbd828461109f565b610bc791906110be565b949350505050565b603380546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b600054610100900460ff16610c485760405162461bcd60e51b81526004016102d5906110e0565b610a4c600054610100900460ff16610c725760405162461bcd60e51b81526004016102d5906110e0565b610a4c33610bcf565b828054828255906000526020600020908101928215610cd0579160200282015b82811115610cd057825182546001600160a01b0319166001600160a01b03909116178255602090920191600190910190610c9b565b50610cdc929150610ce0565b5090565b5b80821115610cdc5760008155600101610ce1565b6001600160a01b03811681146109ef57600080fd5b8035610d1581610cf5565b919050565b600060208284031215610d2c57600080fd5b81356109b081610cf5565b634e487b7160e01b600052604160045260246000fd5b600082601f830112610d5e57600080fd5b8135602067ffffffffffffffff80831115610d7b57610d7b610d37565b8260051b604051601f19603f83011681018181108482111715610da057610da0610d37565b604052938452858101830193838101925087851115610dbe57600080fd5b83870191505b84821015610de457610dd582610d0a565b83529183019190830190610dc4565b979650505050505050565b600080600060608486031215610e0457600080fd5b833567ffffffffffffffff80821115610e1c57600080fd5b610e2887838801610d4d565b94506020860135915080821115610e3e57600080fd5b610e4a87838801610d4d565b93506040860135915080821115610e6057600080fd5b50610e6d86828701610d4d565b9150509250925092565b600080600060608486031215610e8c57600080fd5b8335610e9781610cf5565b92506020840135610ea781610cf5565b91506040840135610eb781610cf5565b809150509250925092565b6020808252825182820181905260009190848201906040850190845b81811015610f035783516001600160a01b031683529284019291840191600101610ede565b50909695505050505050565b600060208284031215610f2157600080fd5b5035919050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6000600019821415610f6857610f68610f3e565b5060010190565b600060208284031215610f8157600080fd5b81516109b081610cf5565b600060208284031215610f9e57600080fd5b815160ff811681146109b057600080fd5b600181815b80851115610fea578160001904821115610fd057610fd0610f3e565b80851615610fdd57918102915b93841c9390800290610fb4565b509250929050565b6000826110015750600161069d565b8161100e5750600061069d565b8160018114611024576002811461102e5761104a565b600191505061069d565b60ff84111561103f5761103f610f3e565b50506001821b61069d565b5060208310610133831016604e8410600b841016171561106d575081810a61069d565b6110778383610faf565b806000190482111561108b5761108b610f3e565b029392505050565b60006109b08383610ff2565b60008160001904831182151516156110b9576110b9610f3e565b500290565b6000826110db57634e487b7160e01b600052601260045260246000fd5b500490565b6020808252602b908201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960408201526a6e697469616c697a696e6760a81b606082015260800190565b60006020828403121561113d57600080fd5b505191905056fea164736f6c634300080a000a";

type BalancerRateProviderOracleConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BalancerRateProviderOracleConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class BalancerRateProviderOracle__factory extends ContractFactory {
  constructor(...args: BalancerRateProviderOracleConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<BalancerRateProviderOracle> {
    return super.deploy(overrides || {}) as Promise<BalancerRateProviderOracle>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): BalancerRateProviderOracle {
    return super.attach(address) as BalancerRateProviderOracle;
  }
  override connect(signer: Signer): BalancerRateProviderOracle__factory {
    return super.connect(signer) as BalancerRateProviderOracle__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BalancerRateProviderOracleInterface {
    return new utils.Interface(_abi) as BalancerRateProviderOracleInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BalancerRateProviderOracle {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as BalancerRateProviderOracle;
  }
}