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
import type {
  AnkrFTMInterestRateModel,
  AnkrFTMInterestRateModelInterface,
} from "../../AnkrFTMInterestRateModel.sol/AnkrFTMInterestRateModel";

const _abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_blocksPerYear",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_baseRateMultiplier",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_jumpMultiplierPerYear",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "kink_",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_day",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "_rate_provider",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ANKR_RATE_PROVIDER",
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
    name: "baseRateMultiplier",
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
    name: "blocksPerYear",
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
    name: "day",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAnkrRate",
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
    name: "getBaseRatePerBlock",
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
    name: "getBorrowRate",
    inputs: [
      {
        name: "cash",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "borrows",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reserves",
        type: "uint256",
        internalType: "uint256",
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
    name: "getBorrowRatePostKink",
    inputs: [
      {
        name: "cash",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "borrows",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reserves",
        type: "uint256",
        internalType: "uint256",
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
    name: "getMultiplierPerBlock",
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
    name: "getSupplyRate",
    inputs: [
      {
        name: "cash",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "borrows",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reserves",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reserveFactorMantissa",
        type: "uint256",
        internalType: "uint256",
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
    name: "isInterestRateModel",
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
    name: "jumpMultiplierPerBlock",
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
    name: "kink",
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
    name: "utilizationRate",
    inputs: [
      {
        name: "cash",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "borrows",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reserves",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "event",
    name: "NewInterestParams",
    inputs: [
      {
        name: "blocksPerYear",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "baseRateMultiplier",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "kink",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161074838038061074883398101604081905261002f91610135565b85858585858560008260ff1611801561004b575060088260ff16105b61009b5760405162461bcd60e51b815260206004820152601a60248201527f5f6461792073686f756c642062652066726f6d203120746f2037000000000000604482015260640160405180910390fd5b600086905560018590556100af86856101a6565b60025560038390556004805460ff84166001600160a81b0319909116176101006001600160a01b0384160217905560005460015460408051928352602083019190915281018490527f865bfff1eb39dc370f97b2eb5990d963c50228429828ad935a4470166c711fc19060600160405180910390a15050505050505050505050506101c8565b60008060008060008060c0878903121561014e57600080fd5b86519550602087015194506040870151935060608701519250608087015160ff8116811461017b57600080fd5b60a08801519092506001600160a01b038116811461019857600080fd5b809150509295509295509295565b6000826101c357634e487b7160e01b600052601260045260246000fd5b500490565b610571806101d76000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c806399e238651161008c578063b9f9850a11610066578063b9f9850a146101c4578063cbf408c1146101cd578063d88e7afe146101d5578063fd2da339146101e857600080fd5b806399e23865146101a0578063a385fb96146101a8578063b8168816146101b157600080fd5b80632486f362116100c85780632486f362146101355780636e71e2d8146101655780637b76ac91146101785780638a8dacd81461019757600080fd5b806315f24053146100ef5780631fcdf96b146101155780632191f92a1461011d575b600080fd5b6101026100fd366004610467565b6101f1565b6040519081526020015b60405180910390f35b610102610281565b610125600181565b604051901515815260200161010c565b60045461014d9061010090046001600160a01b031681565b6040516001600160a01b03909116815260200161010c565b610102610173366004610467565b6102af565b6004546101859060ff1681565b60405160ff909116815260200161010c565b61010260015481565b6101026102f7565b61010260005481565b6101026101bf366004610493565b610317565b61010260025481565b610102610393565b6101026101e3366004610467565b61041a565b61010260035481565b6000806101ff8585856102af565b9050600061020b6102f7565b90506000610217610281565b9050600082670de0b6b3a764000061022f84876104db565b61023991906104fa565b610243919061051c565b9050600354841161025957935061027a92505050565b600061026689898961041a565b9050610272828261051c565b955050505050505b9392505050565b600060035461028e610393565b6102a090670de0b6b3a76400006104db565b6102aa91906104fa565b905090565b6000826102be5750600061027a565b816102c9848661051c565b6102d39190610534565b6102e584670de0b6b3a76400006104db565b6102ef91906104fa565b949350505050565b6000670de0b6b3a764000060015461030d610393565b6102a091906104db565b60008061032c83670de0b6b3a7640000610534565b9050600061033b8787876101f1565b90506000670de0b6b3a764000061035284846104db565b61035c91906104fa565b9050670de0b6b3a7640000816103738a8a8a6102af565b61037d91906104db565b61038791906104fa565b98975050505050505050565b6000805460048054604051632045ac2360e21b815260ff8216928101929092526064916101009091046001600160a01b031690638116b08c90602401602060405180830381865afa1580156103ec573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610410919061054b565b6102a091906104fa565b6000806104288585856102af565b905060006003548261043a9190610534565b9050670de0b6b3a76400006002548261045391906104db565b61045d91906104fa565b9695505050505050565b60008060006060848603121561047c57600080fd5b505081359360208301359350604090920135919050565b600080600080608085870312156104a957600080fd5b5050823594602084013594506040840135936060013592509050565b634e487b7160e01b600052601160045260246000fd5b60008160001904831182151516156104f5576104f56104c5565b500290565b60008261051757634e487b7160e01b600052601260045260246000fd5b500490565b6000821982111561052f5761052f6104c5565b500190565b600082821015610546576105466104c5565b500390565b60006020828403121561055d57600080fd5b505191905056fea164736f6c634300080a000a";

type AnkrFTMInterestRateModelConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: AnkrFTMInterestRateModelConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class AnkrFTMInterestRateModel__factory extends ContractFactory {
  constructor(...args: AnkrFTMInterestRateModelConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _blocksPerYear: BigNumberish,
    _baseRateMultiplier: BigNumberish,
    _jumpMultiplierPerYear: BigNumberish,
    kink_: BigNumberish,
    _day: BigNumberish,
    _rate_provider: string,
    overrides?: Overrides & { from?: string }
  ): Promise<AnkrFTMInterestRateModel> {
    return super.deploy(
      _blocksPerYear,
      _baseRateMultiplier,
      _jumpMultiplierPerYear,
      kink_,
      _day,
      _rate_provider,
      overrides || {}
    ) as Promise<AnkrFTMInterestRateModel>;
  }
  override getDeployTransaction(
    _blocksPerYear: BigNumberish,
    _baseRateMultiplier: BigNumberish,
    _jumpMultiplierPerYear: BigNumberish,
    kink_: BigNumberish,
    _day: BigNumberish,
    _rate_provider: string,
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _blocksPerYear,
      _baseRateMultiplier,
      _jumpMultiplierPerYear,
      kink_,
      _day,
      _rate_provider,
      overrides || {}
    );
  }
  override attach(address: string): AnkrFTMInterestRateModel {
    return super.attach(address) as AnkrFTMInterestRateModel;
  }
  override connect(signer: Signer): AnkrFTMInterestRateModel__factory {
    return super.connect(signer) as AnkrFTMInterestRateModel__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): AnkrFTMInterestRateModelInterface {
    return new utils.Interface(_abi) as AnkrFTMInterestRateModelInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AnkrFTMInterestRateModel {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as AnkrFTMInterestRateModel;
  }
}