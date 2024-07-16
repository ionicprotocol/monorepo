/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  FuseFlywheelCore,
  FuseFlywheelCoreInterface,
} from "../FuseFlywheelCore";

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
        internalType: "contract ERC20",
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
        internalType: "contract ERC20",
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
        internalType: "contract ERC20",
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
        type: "tuple",
        internalType: "struct FlywheelCore.RewardsState",
        components: [
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
  "0x60a06040523480156200001157600080fd5b506040516200163638038062001636833981016040819052620000349162000129565b600080546001600160a01b03199081166001600160a01b0385811691821784556001805490931690851617909155604051879287928792879287928492849233917f8292fce18fa69edf4db7b94ea2e58241df0ae57f97e0a6c9b29067028bf92d769190a36040516001600160a01b0382169033907fa3396fd7f6e0a21b50e5089d2da70d5ac0a3bbbd1f617a93f134b7638998019890600090a35050506001600160a01b0393841660805250600380549284166001600160a01b03199384161790556004805491909316911617905550620001a99350505050565b6001600160a01b03811681146200012657600080fd5b50565b600080600080600060a086880312156200014257600080fd5b85516200014f8162000110565b6020870151909550620001628162000110565b6040870151909450620001758162000110565b6060870151909350620001888162000110565b60808701519092506200019b8162000110565b809150509295509295909350565b60805161145c620001da600039600081816104e2015281816107a60152818161082a0152610a6c015261145c6000f3fe608060405234801561001057600080fd5b50600436106101a95760003560e01c8063abc6d72d116100f9578063cc7ebdc411610097578063e6e162e811610071578063e6e162e8146104a5578063ef5cfb8c146104b7578063f046ee5c146104ca578063f7c618c1146104dd57600080fd5b8063cc7ebdc41461040d578063dde684a514610436578063e1e3dfeb1461049257600080fd5b8063bf7e214f116100d3578063bf7e214f146103ae578063c2ee3a08146103c1578063c3b28864146103d0578063cc6bc101146103e557600080fd5b8063abc6d72d14610214578063b006340d14610265578063b9be44ac1461039b57600080fd5b8063715cad16116101665780638da5cb5b116101405780638da5cb5b146102b95780638fb00913146102e4578063a7a9a62c146102f7578063ab5497d71461038857600080fd5b8063715cad16146102655780637a9e5e4b146102785780637fb5ad381461028b57600080fd5b8063116139d3146101ae57806313af4035146101ff57806317e6a45f146102145780631c9161e01461022c5780634e081c951461023f5780635a826df314610252575b600080fd5b6101e26101bc3660046111f1565b60076020908152600092835260408084209091529082529020546001600160e01b031681565b6040516001600160e01b0390911681526020015b60405180910390f35b61021261020d36600461122a565b610504565b005b61021c600181565b60405190151581526020016101f6565b61021261023a3660046111f1565b61058a565b61021261024d36600461124e565b610599565b61021261026036600461122a565b6105ab565b61021261027336600461122a565b610627565b61021261028636600461122a565b610665565b6102ab61029936600461122a565b60056020526000908152604090205481565b6040519081526020016101f6565b6000546102cc906001600160a01b031681565b6040516001600160a01b0390911681526020016101f6565b6102126102f236600461122a565b61074f565b61035e61030536600461122a565b6040805180820190915260008082526020820152506001600160a01b03166000908152600660209081526040918290208251808401909352546001600160e01b0381168352600160e01b900463ffffffff169082015290565b6040805182516001600160e01b0316815260209283015163ffffffff1692810192909252016101f6565b6004546102cc906001600160a01b031681565b6102ab6103a93660046111f1565b61089f565b6001546102cc906001600160a01b031681565b6101e2670de0b6b3a764000081565b6103d8610915565b6040516101f69190611299565b6103f86103f336600461124e565b610977565b604080519283526020830191909152016101f6565b6102ab61041b36600461122a565b6001600160a01b031660009081526005602052604090205490565b61046e61044436600461122a565b6006602052600090815260409020546001600160e01b03811690600160e01b900463ffffffff1682565b604080516001600160e01b03909316835263ffffffff9091166020830152016101f6565b6102cc6104a03660046112e6565b610a00565b6102126104b33660046111f1565b5050565b6102126104c536600461122a565b610a2a565b6003546102cc906001600160a01b031681565b6102cc7f000000000000000000000000000000000000000000000000000000000000000081565b61051a336000356001600160e01b031916610add565b61053f5760405162461bcd60e51b8152600401610536906112ff565b60405180910390fd5b600080546001600160a01b0319166001600160a01b0383169081178255604051909133917f8292fce18fa69edf4db7b94ea2e58241df0ae57f97e0a6c9b29067028bf92d769190a350565b610594828261089f565b505050565b6105a4838383610977565b5050505050565b6105c1336000356001600160e01b031916610add565b6105dd5760405162461bcd60e51b8152600401610536906112ff565b600480546001600160a01b0319166001600160a01b0383169081179091556040517ff2fb4350e8466c152b500f8e58c0c23f01bbc332dc82f5375267e70b5f50f19990600090a250565b61063d336000356001600160e01b031916610add565b6106595760405162461bcd60e51b8152600401610536906112ff565b61066281610b87565b50565b6000546001600160a01b03163314806106fa575060015460405163b700961360e01b81526001600160a01b039091169063b7009613906106b990339030906001600160e01b03196000351690600401611325565b602060405180830381865afa1580156106d6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106fa9190611352565b61070357600080fd5b600180546001600160a01b0319166001600160a01b03831690811790915560405133907fa3396fd7f6e0a21b50e5089d2da70d5ac0a3bbbd1f617a93f134b7638998019890600090a350565b610765336000356001600160e01b031916610add565b6107815760405162461bcd60e51b8152600401610536906112ff565b6003546040516370a0823160e01b81526001600160a01b0391821660048201526000917f000000000000000000000000000000000000000000000000000000000000000016906370a0823190602401602060405180830381865afa1580156107ed573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108119190611374565b9050801561085457600354610854906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811691168484610cbd565b600380546001600160a01b0319166001600160a01b0384169081179091556040517ff1ba364f52e65f08563196b608289b1da2a923cdd0aa7e20dfe664c4ad294c9590600090a25050565b6001600160a01b03821660009081526006602090815260408083208151808301909252546001600160e01b038116808352600160e01b90910463ffffffff1692820192909252906108f457600091505061090f565b6108fe8482610d40565b905061090b848483610f82565b9150505b92915050565b6060600280548060200260200160405190810160405280929190818152602001828054801561096d57602002820191906000526020600020905b81546001600160a01b0316815260019091019060200180831161094f575b5050505050905090565b6001600160a01b03831660009081526006602090815260408083208151808301909252546001600160e01b038116808352600160e01b90910463ffffffff169282019290925282916109d05760008092509250506109f8565b6109da8682610d40565b90506109e7868683610f82565b6109f2878684610f82565b92509250505b935093915050565b60028181548110610a1057600080fd5b6000918252602090912001546001600160a01b0316905081565b6001600160a01b03811660009081526005602052604090205480156104b3576001600160a01b03808316600090815260056020526040812055600354610a96917f0000000000000000000000000000000000000000000000000000000000000000811691168484610cbd565b816001600160a01b03167f1f89f96333d3133000ee447473151fa9606543368f02271c9d95ae14f13bcc6782604051610ad191815260200190565b60405180910390a25050565b6001546000906001600160a01b03168015801590610b67575060405163b700961360e01b81526001600160a01b0382169063b700961390610b2690879030908890600401611325565b602060405180830381865afa158015610b43573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b679190611352565b8061090b57506000546001600160a01b0385811691161491505092915050565b6001600160a01b0381166000908152600660205260409020546001600160e01b031615610be15760405162461bcd60e51b8152602060048201526008602482015267737472617465677960c01b6044820152606401610536565b6040518060400160405280670de0b6b3a76400006001600160e01b03168152602001610c0c426111b3565b63ffffffff9081169091526001600160a01b038316600081815260066020908152604080832086519690920151909416600160e01b026001600160e01b0390951694909417909355600280546001810182559084527f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace0180546001600160a01b03191682179055905190917f69887873d46778fb35539b0a9992d9176ca03c1820b0afb538bc3a6f63326b1091a250565b60006040516323b872dd60e01b81528460048201528360248201528260448201526020600060648360008a5af13d15601f3d11600160005114161716915050806105a45760405162461bcd60e51b81526020600482015260146024820152731514905394d1915497d19493d357d1905253115160621b6044820152606401610536565b6040805180820190915260008082526020820152600354602083015160405163b334db7b60e01b81526001600160a01b03868116600483015263ffffffff9092166024820152600092919091169063b334db7b906044016020604051808303816000875af1158015610db6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610dda9190611374565b83925090508015610f7b576004546000906001600160a01b0316610e5f57846001600160a01b03166318160ddd6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610e36573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e5a9190611374565b610ecf565b60048054604051631e1932fb60e01b81526001600160a01b0388811693820193909352911690631e1932fb90602401602060405180830381865afa158015610eab573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ecf9190611374565b905060008115610f0157610efe82610eef670de0b6b3a7640000866113a3565b610ef991906113c2565b6111ca565b90505b6040518060400160405280828760000151610f1c91906113e4565b6001600160e01b03168152602001610f33426111b3565b63ffffffff9081169091526001600160a01b0388166000908152600660209081526040909120835191840151909216600160e01b026001600160e01b03909116179055935050505b5092915050565b80516001600160a01b038481166000908152600760209081526040808320938716835292905290812080546001600160e01b038085166001600160e01b03198316179092559192911680610fdb5750670de0b6b3a76400005b6000610fe7828461140f565b6004549091506000906001600160a01b031661106c576040516370a0823160e01b81526001600160a01b0388811660048301528916906370a0823190602401602060405180830381865afa158015611043573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110679190611374565b6110e4565b60048054604051631a50ef2f60e01b81526001600160a01b038b8116938201939093528983166024820152911690631a50ef2f90604401602060405180830381865afa1580156110c0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110e49190611374565b90506000670de0b6b3a76400006111046001600160e01b038516846113a3565b61110e91906113c2565b6001600160a01b03891660009081526005602052604081205491925090611136908390611437565b6001600160a01b03808b16600081815260056020526040908190208490555192935091908c16907f35a61f3c719e8f59f636c336e563ba74f667fadafcc80d709231ca8bb59eecce9061119e9086908b909182526001600160e01b0316602082015260400190565b60405180910390a39998505050505050505050565b600064010000000082106111c657600080fd5b5090565b6000600160e01b82106111c657600080fd5b6001600160a01b038116811461066257600080fd5b6000806040838503121561120457600080fd5b823561120f816111dc565b9150602083013561121f816111dc565b809150509250929050565b60006020828403121561123c57600080fd5b8135611247816111dc565b9392505050565b60008060006060848603121561126357600080fd5b833561126e816111dc565b9250602084013561127e816111dc565b9150604084013561128e816111dc565b809150509250925092565b6020808252825182820181905260009190848201906040850190845b818110156112da5783516001600160a01b0316835292840192918401916001016112b5565b50909695505050505050565b6000602082840312156112f857600080fd5b5035919050565b6020808252600c908201526b15539055551213d49256915160a21b604082015260600190565b6001600160a01b0393841681529190921660208201526001600160e01b0319909116604082015260600190565b60006020828403121561136457600080fd5b8151801515811461124757600080fd5b60006020828403121561138657600080fd5b5051919050565b634e487b7160e01b600052601160045260246000fd5b60008160001904831182151516156113bd576113bd61138d565b500290565b6000826113df57634e487b7160e01b600052601260045260246000fd5b500490565b60006001600160e01b038281168482168083038211156114065761140661138d565b01949350505050565b60006001600160e01b038381169083168181101561142f5761142f61138d565b039392505050565b6000821982111561144a5761144a61138d565b50019056fea164736f6c634300080a000a";

type FuseFlywheelCoreConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FuseFlywheelCoreConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FuseFlywheelCore__factory extends ContractFactory {
  constructor(...args: FuseFlywheelCoreConstructorParams) {
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
  ): Promise<FuseFlywheelCore> {
    return super.deploy(
      _rewardToken,
      _flywheelRewards,
      _flywheelBooster,
      _owner,
      _authority,
      overrides || {}
    ) as Promise<FuseFlywheelCore>;
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
  override attach(address: string): FuseFlywheelCore {
    return super.attach(address) as FuseFlywheelCore;
  }
  override connect(signer: Signer): FuseFlywheelCore__factory {
    return super.connect(signer) as FuseFlywheelCore__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FuseFlywheelCoreInterface {
    return new utils.Interface(_abi) as FuseFlywheelCoreInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FuseFlywheelCore {
    return new Contract(address, _abi, signerOrProvider) as FuseFlywheelCore;
  }
}