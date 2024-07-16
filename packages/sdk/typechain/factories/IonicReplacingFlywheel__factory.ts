/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  IonicReplacingFlywheel,
  IonicReplacingFlywheelInterface,
} from "../IonicReplacingFlywheel";

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
    name: "accrue",
    inputs: [
      {
        name: "strategy",
        type: "address",
        internalType: "contract ERC20",
      },
      {
        name: "user",
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "accrue",
    inputs: [
      {
        name: "strategy",
        type: "address",
        internalType: "contract ERC20",
      },
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
      {
        name: "secondUser",
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
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addInitializedStrategy",
    inputs: [
      {
        name: "strategy",
        type: "address",
        internalType: "contract ERC20",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addMarketForRewards",
    inputs: [
      {
        name: "strategy",
        type: "address",
        internalType: "contract ERC20",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addStrategyForRewards",
    inputs: [
      {
        name: "strategy",
        type: "address",
        internalType: "contract ERC20",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allStrategies",
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
        internalType: "contract ERC20",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "claimRewards",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "compAccrued",
    inputs: [
      {
        name: "user",
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
    name: "feeRecipient",
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
    name: "flywheelBooster",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IFlywheelBooster",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "flywheelPreBorrowerAction",
    inputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "borrower",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "flywheelPreSupplierAction",
    inputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "supplier",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "flywheelPreTransferAction",
    inputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "src",
        type: "address",
        internalType: "address",
      },
      {
        name: "dst",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "flywheelRewards",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IFlywheelRewards",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "flywheelToReplace",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IonicFlywheelCore",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAllStrategies",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "contract ERC20[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "_rewardToken",
        type: "address",
        internalType: "contract ERC20",
      },
      {
        name: "_flywheelRewards",
        type: "address",
        internalType: "contract IFlywheelRewards",
      },
      {
        name: "_flywheelBooster",
        type: "address",
        internalType: "contract IFlywheelBooster",
      },
      {
        name: "_owner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isFlywheel",
    inputs: [],
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
    name: "isRewardsDistributor",
    inputs: [],
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
    name: "marketState",
    inputs: [
      {
        name: "strategy",
        type: "address",
        internalType: "contract ERC20",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint224",
        internalType: "uint224",
      },
      {
        name: "",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    stateMutability: "view",
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
    name: "performanceFee",
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
    name: "reinitialize",
    inputs: [
      {
        name: "_flywheelToReplace",
        type: "address",
        internalType: "contract IonicFlywheelCore",
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
    name: "rewardToken",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ERC20",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rewardsAccrued",
    inputs: [
      {
        name: "user",
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setBooster",
    inputs: [
      {
        name: "newBooster",
        type: "address",
        internalType: "contract IFlywheelBooster",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFlywheelRewards",
    inputs: [
      {
        name: "newFlywheelRewards",
        type: "address",
        internalType: "contract IFlywheelRewards",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "strategyState",
    inputs: [
      {
        name: "strategy",
        type: "address",
        internalType: "contract ERC20",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint224",
        internalType: "uint224",
      },
      {
        name: "",
        type: "uint32",
        internalType: "uint32",
      },
    ],
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
    name: "updateFeeSettings",
    inputs: [
      {
        name: "_performanceFee",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_feeRecipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "userIndex",
    inputs: [
      {
        name: "strategy",
        type: "address",
        internalType: "contract ERC20",
      },
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint224",
        internalType: "uint224",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "AccrueRewards",
    inputs: [
      {
        name: "strategy",
        type: "address",
        indexed: true,
        internalType: "contract ERC20",
      },
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "rewardsDelta",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "rewardsIndex",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AddStrategy",
    inputs: [
      {
        name: "newStrategy",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ClaimRewards",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FlywheelBoosterUpdate",
    inputs: [
      {
        name: "newBooster",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FlywheelRewardsUpdate",
    inputs: [
      {
        name: "newFlywheelRewards",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
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
  {
    type: "event",
    name: "UpdatedFeeSettings",
    inputs: [
      {
        name: "oldPerformanceFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newPerformanceFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "oldFeeRecipient",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "newFeeRecipient",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061001961001e565b6100de565b600054610100900460ff161561008a5760405162461bcd60e51b815260206004820152602760248201527f496e697469616c697a61626c653a20636f6e747261637420697320696e697469604482015266616c697a696e6760c81b606482015260840160405180910390fd5b60005460ff90811610156100dc576000805460ff191660ff9081179091556040519081527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b565b6122ba80620000ee6000396000f3fe608060405234801561001057600080fd5b50600436106102115760003560e01c8063abc6d72d11610125578063e30c3978116100ad578063f2fde38b1161007c578063f2fde38b146104dc578063f7c618c1146104ef578063f7e7d1fd14610502578063f8c8765e14610515578063fc4d33f91461052857600080fd5b8063e30c397814610491578063e6e162e8146104a4578063ef5cfb8c146104b6578063f046ee5c146104c957600080fd5b8063c7102647116100f4578063c710264714610407578063cc6bc1011461041a578063cc7ebdc414610442578063dde684a51461046b578063e1e3dfeb1461047e57600080fd5b8063abc6d72d1461025b578063b006340d14610305578063b9be44ac146103df578063c3b28864146103f257600080fd5b80636e96dfd7116101a8578063877887821161017757806387788782146103395780638da5cb5b146103425780638fb0091314610353578063a7a9a62c14610366578063ab5497d7146103cc57600080fd5b80636e96dfd7146102ea578063715018a6146102fd578063715cad16146103055780637fb5ad381461031857600080fd5b8063202048c1116101e4578063202048c11461028657806346904840146102995780634e081c95146102c45780635a826df3146102d757600080fd5b806310509aa914610216578063116139d31461022b57806317e6a45f1461025b5780631c9161e014610273575b600080fd5b610229610224366004611d43565b610530565b005b61023e610239366004611d73565b610542565b6040516001600160e01b0390911681526020015b60405180910390f35b610263600181565b6040519015158152602001610252565b610229610281366004611d73565b61068b565b610229610294366004611da1565b61069a565b6067546102ac906001600160a01b031681565b6040516001600160a01b039091168152602001610252565b6102296102d2366004611dc5565b610831565b6102296102e5366004611da1565b610843565b6102296102f8366004611da1565b610895565b6102296108ff565b610229610313366004611da1565b610942565b61032b610326366004611da1565b610956565b604051908152602001610252565b61032b60665481565b6033546001600160a01b03166102ac565b610229610361366004611da1565b610a76565b6103a8610374366004611da1565b6001600160a01b03166000908152606d60205260409020546001600160e01b03811691600160e01b90910463ffffffff1690565b604080516001600160e01b03909316835263ffffffff909116602083015201610252565b606b546102ac906001600160a01b031681565b61032b6103ed366004611d73565b610b76565b6103fa610bdf565b6040516102529190611e10565b606f546102ac906001600160a01b031681565b61042d610428366004611dc5565b610c41565b60408051928352602083019190915201610252565b61032b610450366004611da1565b6001600160a01b03166000908152606c602052604090205490565b6103a8610479366004611da1565b610cbf565b6102ac61048c366004611e5d565b610e35565b6065546102ac906001600160a01b031681565b6102296104b2366004611d73565b5050565b6102296104c4366004611da1565b610e5f565b606a546102ac906001600160a01b031681565b6102296104ea366004611da1565b610ee9565b6068546102ac906001600160a01b031681565b610229610510366004611da1565b610f5a565b610229610523366004611e76565b61103c565b6102296111be565b6105386112d2565b6104b2828261132e565b606f546000906001600160a01b031615610654576001600160a01b038084166000908152606e60209081526040808320938616835292905220546001600160e01b031661065457606f5460405163116139d360e01b81526001600160a01b0385811660048301528481166024830152600092169063116139d3906044016020604051808303816000875af11580156105de573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106029190611eee565b90506001600160e01b03811615610652576001600160a01b038481166000908152606e6020908152604080832093871683529290522080546001600160e01b0319166001600160e01b0383161790555b505b506001600160a01b038083166000908152606e60209081526040808320938516835292905220546001600160e01b03165b92915050565b6106958282610b76565b505050565b6106a26112d2565b60006106ad82610cbf565b5090506001600160e01b038116156104b2576000306001600160a01b031663c3b288646040518163ffffffff1660e01b8152600401600060405180830381865afa1580156106ff573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526107279190810190611f2a565b905060005b81518160ff1610156107b657818160ff168151811061074d5761074d611fef565b60200260200101516001600160a01b0316846001600160a01b031614156107a45760405162461bcd60e51b815260206004820152600660248201526508585919195960d21b60448201526064015b60405180910390fd5b806107ae8161201b565b91505061072c565b506069805460018101825560009182527f7fb4302e8e91f9110a6554c2c0a24601252c2a42c2220ca988efcfe3999143080180546001600160a01b0319166001600160a01b03861690811790915560405190917f69887873d46778fb35539b0a9992d9176ca03c1820b0afb538bc3a6f63326b1091a2505050565b61083c838383610c41565b5050505050565b61084b6112d2565b606b80546001600160a01b0319166001600160a01b0383169081179091556040517ff2fb4350e8466c152b500f8e58c0c23f01bbc332dc82f5375267e70b5f50f19990600090a250565b61089d6112d2565b606580546001600160a01b038381166001600160a01b031983168117909355604080519190921680825260208201939093527fb3d55174552271a4f1aaf36b72f50381e892171636b3fb5447fe00e995e7a37b91015b60405180910390a15050565b6109076112d2565b60405162461bcd60e51b815260206004820152601060248201526f6e6f74207573656420616e796d6f726560801b604482015260640161079b565b61094a6112d2565b6109538161141f565b50565b606f546000906001600160a01b031615610a5a576001600160a01b0382166000908152606c60205260409020541580156109a957506001600160a01b03821660009081526070602052604090205460ff16155b15610a5a57606f54604051630ff6b5a760e31b81526001600160a01b0384811660048301526000921690637fb5ad38906024016020604051808303816000875af11580156109fb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a1f919061203b565b90508015610a58576001600160a01b0383166000908152607060209081526040808320805460ff19166001179055606c90915290208190555b505b506001600160a01b03166000908152606c602052604090205490565b610a7e6112d2565b606a546001600160a01b031615610b2c57606854606a546040516370a0823160e01b81526001600160a01b03918216600482015260009291909116906370a0823190602401602060405180830381865afa158015610ae0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b04919061203b565b90508015610b2a57606a54606854610b2a916001600160a01b03918216911684846115c0565b505b606a80546001600160a01b0319166001600160a01b0383169081179091556040517ff1ba364f52e65f08563196b608289b1da2a923cdd0aa7e20dfe664c4ad294c9590600090a250565b6000806000610b8485610cbf565b604080518082019091526001600160e01b03831680825263ffffffff8316602083015292945090925090610bbe5760009350505050610685565b610bc88682611643565b9050610bd5868683611951565b9695505050505050565b60606069805480602002602001604051908101604052809291908181526020018280548015610c3757602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311610c19575b5050505050905090565b600080600080610c5087610cbf565b604080518082019091526001600160e01b03831680825263ffffffff8316602083015292945090925090610c8d5760008094509450505050610cb7565b610c978882611643565b9050610ca4888883611951565b610caf898884611951565b945094505050505b935093915050565b606f5460009081906001600160a01b031615610dff576001600160a01b0383166000908152606d60209081526040918290208251808401909352546001600160e01b038116808452600160e01b90910463ffffffff1691830191909152610dfd57606f5460405163dde684a560e01b81526001600160a01b038681166004830152600092839291169063dde684a59060240160408051808303816000875af1158015610d6f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d939190612054565b91509150816001600160e01b0316600014610dfa576040805180820182526001600160e01b03808516825263ffffffff80851660208085019182526001600160a01b038c166000908152606d909152949094209251935116600160e01b0292169190911790555b50505b505b50506001600160a01b03166000908152606d60205260409020546001600160e01b03811691600160e01b90910463ffffffff1690565b60698181548110610e4557600080fd5b6000918252602090912001546001600160a01b0316905081565b6000610e6a82610956565b905080156104b2576001600160a01b038083166000908152606c6020526040812055606a54606854610ea292908116911684846115c0565b816001600160a01b03167f1f89f96333d3133000ee447473151fa9606543368f02271c9d95ae14f13bcc6782604051610edd91815260200190565b60405180910390a25050565b610ef16112d2565b606554604080516001600160a01b03928316815291831660208301527fb3d55174552271a4f1aaf36b72f50381e892171636b3fb5447fe00e995e7a37b910160405180910390a1606580546001600160a01b0319166001600160a01b0392909216919091179055565b6033546001600160a01b0316331480611019576000610fa07fb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103546001600160a01b031690565b90506001600160a01b0381163314806110165760405162461bcd60e51b815260206004820152603260248201527f4f776e61626c653a2063616c6c6572206973206e65697468657220746865206f6044820152713bb732b9103737b9103a34329030b236b4b760711b606482015260840161079b565b50505b50606f80546001600160a01b0319166001600160a01b0392909216919091179055565b600054610100900460ff161580801561105c5750600054600160ff909116105b806110765750303b158015611076575060005460ff166001145b6110d95760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b606482015260840161079b565b6000805460ff1916600117905580156110fc576000805461ff0019166101001790555b61110533611c25565b606880546001600160a01b038088166001600160a01b031992831617909255606a8054878416908316179055606b80549286169290911691909117905561114b82611c59565b67016345785d8a0000606655606780546001600160a01b0319166001600160a01b038416179055801561083c576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15050505050565b6065546001600160a01b031633146112105760405162461bcd60e51b81526020600482015260156024820152743737ba103a3432903832b73234b7339037bbb732b960591b604482015260640161079b565b60006112246033546001600160a01b031690565b6065549091506001600160a01b031661123c81611c59565b606580546001600160a01b0319169055604080516001600160a01b0384168152600060208201527f70aea8d848e8a90fb7661b227dc522eb6395c3dac71b63cb59edd5c9899b2364910160405180910390a1606554604080516001600160a01b03808516825290921660208301527fb3d55174552271a4f1aaf36b72f50381e892171636b3fb5447fe00e995e7a37b91016108f3565b6033546001600160a01b0316331461132c5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015260640161079b565b565b60665460675460408051928352602083018590526001600160a01b0391821690830152821660608201527fb3b62da5184b9e7e2f5d280014bb485d4444b66738025e5fb5738bbddcb6b8489060800160405180910390a16067546001600160a01b038281169116146113f8576067546113af906001600160a01b0316610956565b6001600160a01b0382166000908152606c6020526040812080549091906113d7908490612089565b90915550506067546001600160a01b03166000908152606c60205260408120555b606691909155606780546001600160a01b0319166001600160a01b03909216919091179055565b600061142a82610cbf565b5090506001600160e01b0381161561146f5760405162461bcd60e51b8152602060048201526008602482015267737472617465677960c01b604482015260640161079b565b6040805180820180835260685463313ce56760e01b9091529151909182916114f7916001600160a01b03169063313ce567906044808601916020918188030181865afa1580156114c3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114e791906120a1565b6114f290600a6121a8565b611cab565b6001600160e01b0316815260200161150e42611cc1565b63ffffffff9081169091526001600160a01b0384166000818152606d6020908152604080832086519690920151909416600160e01b026001600160e01b0390951694909417909355606980546001810182559084527f7fb4302e8e91f9110a6554c2c0a24601252c2a42c2220ca988efcfe3999143080180546001600160a01b03191682179055905190917f69887873d46778fb35539b0a9992d9176ca03c1820b0afb538bc3a6f63326b1091a25050565b60006040516323b872dd60e01b81528460048201528360248201528260448201526020600060648360008a5af13d15601f3d116001600051141617169150508061083c5760405162461bcd60e51b81526020600482015260146024820152731514905394d1915497d19493d357d1905253115160621b604482015260640161079b565b6040805180820190915260008082526020820152606a54602083015160405163b334db7b60e01b81526001600160a01b03868116600483015263ffffffff9092166024820152600092919091169063b334db7b906044016020604051808303816000875af11580156116b9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116dd919061203b565b8392509050801561194a57606b546000906001600160a01b031661176257846001600160a01b03166318160ddd6040518163ffffffff1660e01b8152600401602060405180830381865afa158015611739573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061175d919061203b565b6117d0565b606b54604051631e1932fb60e01b81526001600160a01b03878116600483015290911690631e1932fb90602401602060405180830381865afa1580156117ac573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117d0919061203b565b90506000670de0b6b3a76400006001600160e01b0316606654846117f491906121b7565b6117fe91906121d6565b6067546001600160a01b03166000908152606c602052604081208054929350839290919061182d908490612089565b9091555061183d905081846121f8565b9250600082156118cf576118cc83886001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015611889573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118ad91906120a1565b6118b890600a6121a8565b6118c290876121b7565b6114f291906121d6565b90505b60405180604001604052808288600001516118ea919061220f565b6001600160e01b0316815260200161190142611cc1565b63ffffffff9081169091526001600160a01b0389166000908152606d60209081526040909120835191840151909216600160e01b026001600160e01b0390911617905594505050505b5092915050565b8051600090816119618686610542565b6001600160a01b038781166000908152606e60209081526040808320938a1683529290522080546001600160e01b0319166001600160e01b038581169190911790915590915081166119fb576068546040805163313ce56760e01b815290516119f8926001600160a01b03169163313ce5679160048083019260209291908290030181865afa1580156114c3573d6000803e3d6000fd5b90505b6000611a07828461223a565b606b549091506000906001600160a01b0316611a8c576040516370a0823160e01b81526001600160a01b0388811660048301528916906370a0823190602401602060405180830381865afa158015611a63573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a87919061203b565b611b02565b606b54604051631a50ef2f60e01b81526001600160a01b038a81166004830152898116602483015290911690631a50ef2f90604401602060405180830381865afa158015611ade573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b02919061203b565b90506000886001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015611b44573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b6891906120a1565b611b7390600a6121a8565b611b86836001600160e01b0386166121b7565b611b9091906121d6565b9050600081611b9e8a610956565b611ba89190612089565b6001600160a01b03808b166000818152606c6020526040908190208490555192935091908c16907f35a61f3c719e8f59f636c336e563ba74f667fadafcc80d709231ca8bb59eecce90611c109086908b909182526001600160e01b0316602082015260400190565b60405180910390a39998505050505050505050565b600054610100900460ff16611c4c5760405162461bcd60e51b815260040161079b90612262565b611c54611cd4565b610953815b603380546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6000600160e01b8210611cbd57600080fd5b5090565b60006401000000008210611cbd57600080fd5b600054610100900460ff16611cfb5760405162461bcd60e51b815260040161079b90612262565b61132c600054610100900460ff16611d255760405162461bcd60e51b815260040161079b90612262565b61132c33611c59565b6001600160a01b038116811461095357600080fd5b60008060408385031215611d5657600080fd5b823591506020830135611d6881611d2e565b809150509250929050565b60008060408385031215611d8657600080fd5b8235611d9181611d2e565b91506020830135611d6881611d2e565b600060208284031215611db357600080fd5b8135611dbe81611d2e565b9392505050565b600080600060608486031215611dda57600080fd5b8335611de581611d2e565b92506020840135611df581611d2e565b91506040840135611e0581611d2e565b809150509250925092565b6020808252825182820181905260009190848201906040850190845b81811015611e515783516001600160a01b031683529284019291840191600101611e2c565b50909695505050505050565b600060208284031215611e6f57600080fd5b5035919050565b60008060008060808587031215611e8c57600080fd5b8435611e9781611d2e565b93506020850135611ea781611d2e565b92506040850135611eb781611d2e565b91506060850135611ec781611d2e565b939692955090935050565b80516001600160e01b0381168114611ee957600080fd5b919050565b600060208284031215611f0057600080fd5b611dbe82611ed2565b634e487b7160e01b600052604160045260246000fd5b8051611ee981611d2e565b60006020808385031215611f3d57600080fd5b825167ffffffffffffffff80821115611f5557600080fd5b818501915085601f830112611f6957600080fd5b815181811115611f7b57611f7b611f09565b8060051b604051601f19603f83011681018181108582111715611fa057611fa0611f09565b604052918252848201925083810185019188831115611fbe57600080fd5b938501935b82851015611fe357611fd485611f1f565b84529385019392850192611fc3565b98975050505050505050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060ff821660ff81141561203257612032612005565b60010192915050565b60006020828403121561204d57600080fd5b5051919050565b6000806040838503121561206757600080fd5b61207083611ed2565b9150602083015163ffffffff81168114611d6857600080fd5b6000821982111561209c5761209c612005565b500190565b6000602082840312156120b357600080fd5b815160ff81168114611dbe57600080fd5b600181815b808511156120ff5781600019048211156120e5576120e5612005565b808516156120f257918102915b93841c93908002906120c9565b509250929050565b60008261211657506001610685565b8161212357506000610685565b816001811461213957600281146121435761215f565b6001915050610685565b60ff84111561215457612154612005565b50506001821b610685565b5060208310610133831016604e8410600b8410161715612182575081810a610685565b61218c83836120c4565b80600019048211156121a0576121a0612005565b029392505050565b6000611dbe60ff841683612107565b60008160001904831182151516156121d1576121d1612005565b500290565b6000826121f357634e487b7160e01b600052601260045260246000fd5b500490565b60008282101561220a5761220a612005565b500390565b60006001600160e01b0382811684821680830382111561223157612231612005565b01949350505050565b60006001600160e01b038381169083168181101561225a5761225a612005565b039392505050565b6020808252602b908201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960408201526a6e697469616c697a696e6760a81b60608201526080019056fea164736f6c634300080a000a";

type IonicReplacingFlywheelConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: IonicReplacingFlywheelConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class IonicReplacingFlywheel__factory extends ContractFactory {
  constructor(...args: IonicReplacingFlywheelConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<IonicReplacingFlywheel> {
    return super.deploy(overrides || {}) as Promise<IonicReplacingFlywheel>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): IonicReplacingFlywheel {
    return super.attach(address) as IonicReplacingFlywheel;
  }
  override connect(signer: Signer): IonicReplacingFlywheel__factory {
    return super.connect(signer) as IonicReplacingFlywheel__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): IonicReplacingFlywheelInterface {
    return new utils.Interface(_abi) as IonicReplacingFlywheelInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IonicReplacingFlywheel {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IonicReplacingFlywheel;
  }
}
