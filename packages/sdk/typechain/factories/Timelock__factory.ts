/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Timelock, TimelockInterface } from "../Timelock";

const _abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "admin_",
        type: "address",
        internalType: "address",
      },
      {
        name: "delay_",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "GRACE_PERIOD",
    inputs: [],
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
    name: "MAXIMUM_DELAY",
    inputs: [],
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
    name: "MINIMUM_DELAY",
    inputs: [],
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
    name: "acceptAdmin",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "admin",
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
    name: "cancelTransaction",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "signature",
        type: "string",
        internalType: "string",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "eta",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "delay",
    inputs: [],
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
    name: "executeTransaction",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "signature",
        type: "string",
        internalType: "string",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "eta",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "pendingAdmin",
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
    name: "queueTransaction",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "signature",
        type: "string",
        internalType: "string",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "eta",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "queuedTransactions",
    inputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setDelay",
    inputs: [
      {
        name: "delay_",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPendingAdmin",
    inputs: [
      {
        name: "pendingAdmin_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "CancelTransaction",
    inputs: [
      {
        name: "txHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "target",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "signature",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "data",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
      {
        name: "eta",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ExecuteTransaction",
    inputs: [
      {
        name: "txHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "target",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "signature",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "data",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
      {
        name: "eta",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewAdmin",
    inputs: [
      {
        name: "newAdmin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewDelay",
    inputs: [
      {
        name: "newDelay",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewPendingAdmin",
    inputs: [
      {
        name: "newPendingAdmin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "QueueTransaction",
    inputs: [
      {
        name: "txHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "target",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "signature",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "data",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
      {
        name: "eta",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161110138038061110183398101604081905261002f9161014f565b6202a3008110156100ad5760405162461bcd60e51b815260206004820152603760248201527f54696d656c6f636b3a3a636f6e7374727563746f723a2044656c6179206d757360448201527f7420657863656564206d696e696d756d2064656c61792e00000000000000000060648201526084015b60405180910390fd5b62278d008111156101265760405162461bcd60e51b815260206004820152603860248201527f54696d656c6f636b3a3a73657444656c61793a2044656c6179206d757374206e60448201527f6f7420657863656564206d6178696d756d2064656c61792e000000000000000060648201526084016100a4565b600080546001600160a01b0319166001600160a01b039390931692909217909155600255610189565b6000806040838503121561016257600080fd5b82516001600160a01b038116811461017957600080fd5b6020939093015192949293505050565b610f69806101986000396000f3fe6080604052600436106100c65760003560e01c80636a42b8f81161007f578063c1a287e211610059578063c1a287e2146101fc578063e177246e14610213578063f2b0653714610233578063f851a4401461027357600080fd5b80636a42b8f8146101b85780637d645fab146101ce578063b1b43ae5146101e557600080fd5b80630825f38f146100d25780630e18b681146100fb57806326782247146101125780633a66f9011461014a5780634dd18bf514610178578063591fcdfe1461019857600080fd5b366100cd57005b600080fd5b6100e56100e0366004610cec565b610293565b6040516100f29190610df9565b60405180910390f35b34801561010757600080fd5b50610110610604565b005b34801561011e57600080fd5b50600154610132906001600160a01b031681565b6040516001600160a01b0390911681526020016100f2565b34801561015657600080fd5b5061016a610165366004610cec565b6106cd565b6040519081526020016100f2565b34801561018457600080fd5b50610110610193366004610e0c565b610880565b3480156101a457600080fd5b506101106101b3366004610cec565b61093f565b3480156101c457600080fd5b5061016a60025481565b3480156101da57600080fd5b5061016a62278d0081565b3480156101f157600080fd5b5061016a6202a30081565b34801561020857600080fd5b5061016a6212750081565b34801561021f57600080fd5b5061011061022e366004610e27565b610a59565b34801561023f57600080fd5b5061026361024e366004610e27565b60036020526000908152604090205460ff1681565b60405190151581526020016100f2565b34801561027f57600080fd5b50600054610132906001600160a01b031681565b6000546060906001600160a01b0316331461031b5760405162461bcd60e51b815260206004820152603860248201527f54696d656c6f636b3a3a657865637574655472616e73616374696f6e3a20436160448201527f6c6c206d75737420636f6d652066726f6d2061646d696e2e000000000000000060648201526084015b60405180910390fd5b60008686868686604051602001610336959493929190610e40565b60408051601f1981840301815291815281516020928301206000818152600390935291205490915060ff166103c15760405162461bcd60e51b815260206004820152603d6024820152600080516020610f3d83398151915260448201527f616e73616374696f6e206861736e2774206265656e207175657565642e0000006064820152608401610312565b824210156104335760405162461bcd60e51b81526020600482015260456024820152600080516020610f3d83398151915260448201527f616e73616374696f6e206861736e2774207375727061737365642074696d65206064820152643637b1b59760d91b608482015260a401610312565b6104408362127500610bde565b4211156104995760405162461bcd60e51b81526020600482015260336024820152600080516020610f3d83398151915260448201527230b739b0b1ba34b7b71034b99039ba30b6329760691b6064820152608401610312565b6000818152600360205260409020805460ff1916905584516060906104bf5750836104eb565b8580519060200120856040516020016104d9929190610e8c565b60405160208183030381529060405290505b600080896001600160a01b031689846040516105079190610ebd565b60006040518083038185875af1925050503d8060008114610544576040519150601f19603f3d011682016040523d82523d6000602084013e610549565b606091505b5091509150816105af5760405162461bcd60e51b815260206004820152603d6024820152600080516020610f3d83398151915260448201527f616e73616374696f6e20657865637574696f6e2072657665727465642e0000006064820152608401610312565b896001600160a01b0316847fa560e3198060a2f10670c1ec5b403077ea6ae93ca8de1c32b451dc1a943cd6e78b8b8b8b6040516105ef9493929190610ed9565b60405180910390a39998505050505050505050565b6001546001600160a01b031633146106845760405162461bcd60e51b815260206004820152603860248201527f54696d656c6f636b3a3a61636365707441646d696e3a2043616c6c206d75737460448201527f20636f6d652066726f6d2070656e64696e6741646d696e2e00000000000000006064820152608401610312565b60008054336001600160a01b0319918216811783556001805490921690915560405190917f71614071b88dee5e0b2ae578a9dd7b2ebbe9ae832ba419dc0242cd065a290b6c91a2565b600080546001600160a01b031633146107475760405162461bcd60e51b815260206004820152603660248201527f54696d656c6f636b3a3a71756575655472616e73616374696f6e3a2043616c6c6044820152751036bab9ba1031b7b6b290333937b69030b236b4b71760511b6064820152608401610312565b61075a6002546107544290565b90610bde565b8210156107e15760405162461bcd60e51b815260206004820152604960248201527f54696d656c6f636b3a3a71756575655472616e73616374696f6e3a204573746960448201527f6d6174656420657865637574696f6e20626c6f636b206d757374207361746973606482015268333c903232b630bc9760b91b608482015260a401610312565b600086868686866040516020016107fc959493929190610e40565b60408051601f19818403018152828252805160209182012060008181526003909252919020805460ff1916600117905591506001600160a01b0388169082907f76e2796dc3a81d57b0e8504b647febcbeeb5f4af818e164f11eef8131a6a763f9061086e908a908a908a908a90610ed9565b60405180910390a39695505050505050565b3330146108f55760405162461bcd60e51b815260206004820152603860248201527f54696d656c6f636b3a3a73657450656e64696e6741646d696e3a2043616c6c2060448201527f6d75737420636f6d652066726f6d2054696d656c6f636b2e00000000000000006064820152608401610312565b600180546001600160a01b0319166001600160a01b0383169081179091556040517f69d78e38a01985fbb1462961809b4b2d65531bc93b2b94037f3334b82ca4a75690600090a250565b6000546001600160a01b031633146109bf5760405162461bcd60e51b815260206004820152603760248201527f54696d656c6f636b3a3a63616e63656c5472616e73616374696f6e3a2043616c60448201527f6c206d75737420636f6d652066726f6d2061646d696e2e0000000000000000006064820152608401610312565b600085858585856040516020016109da959493929190610e40565b60408051601f19818403018152828252805160209182012060008181526003909252919020805460ff1916905591506001600160a01b0387169082907f2fffc091a501fd91bfbff27141450d3acb40fb8e6d8382b243ec7a812a3aaf8790610a49908990899089908990610ed9565b60405180910390a3505050505050565b333014610ac25760405162461bcd60e51b815260206004820152603160248201527f54696d656c6f636b3a3a73657444656c61793a2043616c6c206d75737420636f60448201527036b290333937b6902a34b6b2b637b1b59760791b6064820152608401610312565b6202a300811015610b325760405162461bcd60e51b815260206004820152603460248201527f54696d656c6f636b3a3a73657444656c61793a2044656c6179206d75737420656044820152733c31b2b2b21036b4b734b6bab6903232b630bc9760611b6064820152608401610312565b62278d00811115610bab5760405162461bcd60e51b815260206004820152603860248201527f54696d656c6f636b3a3a73657444656c61793a2044656c6179206d757374206e60448201527f6f7420657863656564206d6178696d756d2064656c61792e00000000000000006064820152608401610312565b600281905560405181907f948b1f6a42ee138b7e34058ba85a37f716d55ff25ff05a763f15bed6a04c8d2c90600090a250565b600080610beb8385610f16565b905083811015610c3d5760405162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f7700000000006044820152606401610312565b9392505050565b80356001600160a01b0381168114610c5b57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b600067ffffffffffffffff80841115610c9157610c91610c60565b604051601f8501601f19908116603f01168101908282118183101715610cb957610cb9610c60565b81604052809350858152868686011115610cd257600080fd5b858560208301376000602087830101525050509392505050565b600080600080600060a08688031215610d0457600080fd5b610d0d86610c44565b945060208601359350604086013567ffffffffffffffff80821115610d3157600080fd5b818801915088601f830112610d4557600080fd5b610d5489833560208501610c76565b94506060880135915080821115610d6a57600080fd5b508601601f81018813610d7c57600080fd5b610d8b88823560208401610c76565b95989497509295608001359392505050565b60005b83811015610db8578181015183820152602001610da0565b83811115610dc7576000848401525b50505050565b60008151808452610de5816020860160208601610d9d565b601f01601f19169290920160200192915050565b602081526000610c3d6020830184610dcd565b600060208284031215610e1e57600080fd5b610c3d82610c44565b600060208284031215610e3957600080fd5b5035919050565b60018060a01b038616815284602082015260a060408201526000610e6760a0830186610dcd565b8281036060840152610e798186610dcd565b9150508260808301529695505050505050565b6001600160e01b0319831681528151600090610eaf816004850160208701610d9d565b919091016004019392505050565b60008251610ecf818460208701610d9d565b9190910192915050565b848152608060208201526000610ef26080830186610dcd565b8281036040840152610f048186610dcd565b91505082606083015295945050505050565b60008219821115610f3757634e487b7160e01b600052601160045260246000fd5b50019056fe54696d656c6f636b3a3a657865637574655472616e73616374696f6e3a205472a164736f6c634300080a000a";

type TimelockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TimelockConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Timelock__factory extends ContractFactory {
  constructor(...args: TimelockConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    admin_: string,
    delay_: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<Timelock> {
    return super.deploy(admin_, delay_, overrides || {}) as Promise<Timelock>;
  }
  override getDeployTransaction(
    admin_: string,
    delay_: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(admin_, delay_, overrides || {});
  }
  override attach(address: string): Timelock {
    return super.attach(address) as Timelock;
  }
  override connect(signer: Signer): Timelock__factory {
    return super.connect(signer) as Timelock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TimelockInterface {
    return new utils.Interface(_abi) as TimelockInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Timelock {
    return new Contract(address, _abi, signerOrProvider) as Timelock;
  }
}
