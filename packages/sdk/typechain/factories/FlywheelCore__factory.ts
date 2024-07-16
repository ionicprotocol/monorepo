/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { FlywheelCore, FlywheelCoreInterface } from "../FlywheelCore";

const _abi = [
  {
    type: "constructor",
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
      {
        name: "_authority",
        type: "address",
        internalType: "contract Authority",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ONE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint224",
        internalType: "uint224",
      },
    ],
    stateMutability: "view",
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
    name: "authority",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract Authority",
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
        name: "",
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
    name: "setAuthority",
    inputs: [
      {
        name: "newAuthority",
        type: "address",
        internalType: "contract Authority",
      },
    ],
    outputs: [],
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
    name: "setOwner",
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
    name: "strategyState",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ERC20",
      },
    ],
    outputs: [
      {
        name: "index",
        type: "uint224",
        internalType: "uint224",
      },
      {
        name: "lastUpdatedTimestamp",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "userIndex",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ERC20",
      },
      {
        name: "",
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
    stateMutability: "view",
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
    name: "AuthorityUpdated",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newAuthority",
        type: "address",
        indexed: true,
        internalType: "contract Authority",
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
    name: "OwnerUpdated",
    inputs: [
      {
        name: "user",
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
  "0x60a06040523480156200001157600080fd5b506040516200147b3803806200147b833981016040819052620000349162000119565b600080546001600160a01b03199081166001600160a01b0385811691821784556001805490931690851617909155604051849284929133917f8292fce18fa69edf4db7b94ea2e58241df0ae57f97e0a6c9b29067028bf92d7691a36040516001600160a01b0382169033907fa3396fd7f6e0a21b50e5089d2da70d5ac0a3bbbd1f617a93f134b7638998019890600090a35050506001600160a01b0393841660805250600380549284166001600160a01b03199384161790556004805491909316911617905562000199565b6001600160a01b03811681146200011657600080fd5b50565b600080600080600060a086880312156200013257600080fd5b85516200013f8162000100565b6020870151909550620001528162000100565b6040870151909450620001658162000100565b6060870151909350620001788162000100565b60808701519092506200018b8162000100565b809150509295509295909350565b6080516112b1620001ca60003960008181610350015281816105f30152818161067701526108b901526112b16000f3fe608060405234801561001057600080fd5b50600436106101215760003560e01c8063b9be44ac116100ad578063dde684a511610071578063dde684a5146102b6578063e1e3dfeb14610312578063ef5cfb8c14610325578063f046ee5c14610338578063f7c618c11461034b57600080fd5b8063b9be44ac14610244578063bf7e214f14610257578063c2ee3a081461026a578063c3b2886414610279578063cc6bc1011461028e57600080fd5b80637a9e5e4b116100f45780637a9e5e4b146101b25780637fb5ad38146101c55780638da5cb5b146101f35780638fb009131461021e578063ab5497d71461023157600080fd5b8063116139d31461012657806313af4035146101775780635a826df31461018c578063715cad161461019f575b600080fd5b61015a610134366004611046565b60076020908152600092835260408084209091529082529020546001600160e01b031681565b6040516001600160e01b0390911681526020015b60405180910390f35b61018a61018536600461107f565b610372565b005b61018a61019a36600461107f565b6103f8565b61018a6101ad36600461107f565b610474565b61018a6101c036600461107f565b6104b2565b6101e56101d336600461107f565b60056020526000908152604090205481565b60405190815260200161016e565b600054610206906001600160a01b031681565b6040516001600160a01b03909116815260200161016e565b61018a61022c36600461107f565b61059c565b600454610206906001600160a01b031681565b6101e5610252366004611046565b6106ec565b600154610206906001600160a01b031681565b61015a670de0b6b3a764000081565b610281610762565b60405161016e91906110a3565b6102a161029c3660046110f0565b6107c4565b6040805192835260208301919091520161016e565b6102ee6102c436600461107f565b6006602052600090815260409020546001600160e01b03811690600160e01b900463ffffffff1682565b604080516001600160e01b03909316835263ffffffff90911660208301520161016e565b61020661032036600461113b565b61084d565b61018a61033336600461107f565b610877565b600354610206906001600160a01b031681565b6102067f000000000000000000000000000000000000000000000000000000000000000081565b610388336000356001600160e01b03191661092b565b6103ad5760405162461bcd60e51b81526004016103a490611154565b60405180910390fd5b600080546001600160a01b0319166001600160a01b0383169081178255604051909133917f8292fce18fa69edf4db7b94ea2e58241df0ae57f97e0a6c9b29067028bf92d769190a350565b61040e336000356001600160e01b03191661092b565b61042a5760405162461bcd60e51b81526004016103a490611154565b600480546001600160a01b0319166001600160a01b0383169081179091556040517ff2fb4350e8466c152b500f8e58c0c23f01bbc332dc82f5375267e70b5f50f19990600090a250565b61048a336000356001600160e01b03191661092b565b6104a65760405162461bcd60e51b81526004016103a490611154565b6104af816109d5565b50565b6000546001600160a01b0316331480610547575060015460405163b700961360e01b81526001600160a01b039091169063b70096139061050690339030906001600160e01b0319600035169060040161117a565b602060405180830381865afa158015610523573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061054791906111a7565b61055057600080fd5b600180546001600160a01b0319166001600160a01b03831690811790915560405133907fa3396fd7f6e0a21b50e5089d2da70d5ac0a3bbbd1f617a93f134b7638998019890600090a350565b6105b2336000356001600160e01b03191661092b565b6105ce5760405162461bcd60e51b81526004016103a490611154565b6003546040516370a0823160e01b81526001600160a01b0391821660048201526000917f000000000000000000000000000000000000000000000000000000000000000016906370a0823190602401602060405180830381865afa15801561063a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061065e91906111c9565b905080156106a1576003546106a1906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811691168484610b0b565b600380546001600160a01b0319166001600160a01b0384169081179091556040517ff1ba364f52e65f08563196b608289b1da2a923cdd0aa7e20dfe664c4ad294c9590600090a25050565b6001600160a01b03821660009081526006602090815260408083208151808301909252546001600160e01b038116808352600160e01b90910463ffffffff16928201929092529061074157600091505061075c565b61074b8482610b95565b9050610758848483610dd7565b9150505b92915050565b606060028054806020026020016040519081016040528092919081815260200182805480156107ba57602002820191906000526020600020905b81546001600160a01b0316815260019091019060200180831161079c575b5050505050905090565b6001600160a01b03831660009081526006602090815260408083208151808301909252546001600160e01b038116808352600160e01b90910463ffffffff1692820192909252829161081d576000809250925050610845565b6108278682610b95565b9050610834868683610dd7565b61083f878684610dd7565b92509250505b935093915050565b6002818154811061085d57600080fd5b6000918252602090912001546001600160a01b0316905081565b6001600160a01b0381166000908152600560205260409020548015610927576001600160a01b038083166000908152600560205260408120556003546108e3917f0000000000000000000000000000000000000000000000000000000000000000811691168484610b0b565b816001600160a01b03167f1f89f96333d3133000ee447473151fa9606543368f02271c9d95ae14f13bcc678260405161091e91815260200190565b60405180910390a25b5050565b6001546000906001600160a01b031680158015906109b5575060405163b700961360e01b81526001600160a01b0382169063b7009613906109749087903090889060040161117a565b602060405180830381865afa158015610991573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109b591906111a7565b8061075857506000546001600160a01b0385811691161491505092915050565b6001600160a01b0381166000908152600660205260409020546001600160e01b031615610a2f5760405162461bcd60e51b8152602060048201526008602482015267737472617465677960c01b60448201526064016103a4565b6040518060400160405280670de0b6b3a76400006001600160e01b03168152602001610a5a42611008565b63ffffffff9081169091526001600160a01b038316600081815260066020908152604080832086519690920151909416600160e01b026001600160e01b0390951694909417909355600280546001810182559084527f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace0180546001600160a01b03191682179055905190917f69887873d46778fb35539b0a9992d9176ca03c1820b0afb538bc3a6f63326b1091a250565b60006040516323b872dd60e01b81528460048201528360248201528260448201526020600060648360008a5af13d15601f3d1160016000511416171691505080610b8e5760405162461bcd60e51b81526020600482015260146024820152731514905394d1915497d19493d357d1905253115160621b60448201526064016103a4565b5050505050565b6040805180820190915260008082526020820152600354602083015160405163b334db7b60e01b81526001600160a01b03868116600483015263ffffffff9092166024820152600092919091169063b334db7b906044016020604051808303816000875af1158015610c0b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c2f91906111c9565b83925090508015610dd0576004546000906001600160a01b0316610cb457846001600160a01b03166318160ddd6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610c8b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610caf91906111c9565b610d24565b60048054604051631e1932fb60e01b81526001600160a01b0388811693820193909352911690631e1932fb90602401602060405180830381865afa158015610d00573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d2491906111c9565b905060008115610d5657610d5382610d44670de0b6b3a7640000866111f8565b610d4e9190611217565b61101f565b90505b6040518060400160405280828760000151610d719190611239565b6001600160e01b03168152602001610d8842611008565b63ffffffff9081169091526001600160a01b0388166000908152600660209081526040909120835191840151909216600160e01b026001600160e01b03909116179055935050505b5092915050565b80516001600160a01b038481166000908152600760209081526040808320938716835292905290812080546001600160e01b038085166001600160e01b03198316179092559192911680610e305750670de0b6b3a76400005b6000610e3c8284611264565b6004549091506000906001600160a01b0316610ec1576040516370a0823160e01b81526001600160a01b0388811660048301528916906370a0823190602401602060405180830381865afa158015610e98573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ebc91906111c9565b610f39565b60048054604051631a50ef2f60e01b81526001600160a01b038b8116938201939093528983166024820152911690631a50ef2f90604401602060405180830381865afa158015610f15573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f3991906111c9565b90506000670de0b6b3a7640000610f596001600160e01b038516846111f8565b610f639190611217565b6001600160a01b03891660009081526005602052604081205491925090610f8b90839061128c565b6001600160a01b03808b16600081815260056020526040908190208490555192935091908c16907f35a61f3c719e8f59f636c336e563ba74f667fadafcc80d709231ca8bb59eecce90610ff39086908b909182526001600160e01b0316602082015260400190565b60405180910390a39998505050505050505050565b6000640100000000821061101b57600080fd5b5090565b6000600160e01b821061101b57600080fd5b6001600160a01b03811681146104af57600080fd5b6000806040838503121561105957600080fd5b823561106481611031565b9150602083013561107481611031565b809150509250929050565b60006020828403121561109157600080fd5b813561109c81611031565b9392505050565b6020808252825182820181905260009190848201906040850190845b818110156110e45783516001600160a01b0316835292840192918401916001016110bf565b50909695505050505050565b60008060006060848603121561110557600080fd5b833561111081611031565b9250602084013561112081611031565b9150604084013561113081611031565b809150509250925092565b60006020828403121561114d57600080fd5b5035919050565b6020808252600c908201526b15539055551213d49256915160a21b604082015260600190565b6001600160a01b0393841681529190921660208201526001600160e01b0319909116604082015260600190565b6000602082840312156111b957600080fd5b8151801515811461109c57600080fd5b6000602082840312156111db57600080fd5b5051919050565b634e487b7160e01b600052601160045260246000fd5b6000816000190483118215151615611212576112126111e2565b500290565b60008261123457634e487b7160e01b600052601260045260246000fd5b500490565b60006001600160e01b0382811684821680830382111561125b5761125b6111e2565b01949350505050565b60006001600160e01b0383811690831681811015611284576112846111e2565b039392505050565b6000821982111561129f5761129f6111e2565b50019056fea164736f6c634300080a000a";

type FlywheelCoreConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FlywheelCoreConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FlywheelCore__factory extends ContractFactory {
  constructor(...args: FlywheelCoreConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _rewardToken: string,
    _flywheelRewards: string,
    _flywheelBooster: string,
    _owner: string,
    _authority: string,
    overrides?: Overrides & { from?: string }
  ): Promise<FlywheelCore> {
    return super.deploy(
      _rewardToken,
      _flywheelRewards,
      _flywheelBooster,
      _owner,
      _authority,
      overrides || {}
    ) as Promise<FlywheelCore>;
  }
  override getDeployTransaction(
    _rewardToken: string,
    _flywheelRewards: string,
    _flywheelBooster: string,
    _owner: string,
    _authority: string,
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _rewardToken,
      _flywheelRewards,
      _flywheelBooster,
      _owner,
      _authority,
      overrides || {}
    );
  }
  override attach(address: string): FlywheelCore {
    return super.attach(address) as FlywheelCore;
  }
  override connect(signer: Signer): FlywheelCore__factory {
    return super.connect(signer) as FlywheelCore__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FlywheelCoreInterface {
    return new utils.Interface(_abi) as FlywheelCoreInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FlywheelCore {
    return new Contract(address, _abi, signerOrProvider) as FlywheelCore;
  }
}