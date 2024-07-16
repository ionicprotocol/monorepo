/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  BoringBatchable,
  BoringBatchableInterface,
} from "../../BoringBatchable.sol/BoringBatchable";

const _abi = [
  {
    type: "function",
    name: "batch",
    inputs: [
      {
        name: "calls",
        type: "bytes[]",
        internalType: "bytes[]",
      },
      {
        name: "revertOnFail",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "permitToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "contract IERC20",
      },
      {
        name: "from",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "v",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "r",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061049c806100206000396000f3fe6080604052600436106100295760003560e01c80637c516e941461002e578063d2423b5114610055575b600080fd5b34801561003a57600080fd5b506100536100493660046101bc565b5050505050505050565b005b610053610063366004610245565b60005b828110156101395760008030868685818110610084576100846102d0565b905060200281019061009691906102e6565b6040516100a4929190610334565b600060405180830381855af49150503d80600081146100df576040519150601f19603f3d011682016040523d82523d6000602084013e6100e4565b606091505b5091509150811580156100f45750835b15610124576101028161013f565b60405162461bcd60e51b815260040161011b9190610370565b60405180910390fd5b50508080610131906103a3565b915050610066565b50505050565b606060448251101561018457505060408051808201909152601d81527f5472616e73616374696f6e2072657665727465642073696c656e746c79000000602082015290565b6004820191508180602001905181019061019e91906103e2565b92915050565b6001600160a01b03811681146101b957600080fd5b50565b600080600080600080600080610100898b0312156101d957600080fd5b88356101e4816101a4565b975060208901356101f4816101a4565b96506040890135610204816101a4565b9550606089013594506080890135935060a089013560ff8116811461022857600080fd5b979a969950949793969295929450505060c08201359160e0013590565b60008060006040848603121561025a57600080fd5b833567ffffffffffffffff8082111561027257600080fd5b818601915086601f83011261028657600080fd5b81358181111561029557600080fd5b8760208260051b85010111156102aa57600080fd5b6020928301955093505084013580151581146102c557600080fd5b809150509250925092565b634e487b7160e01b600052603260045260246000fd5b6000808335601e198436030181126102fd57600080fd5b83018035915067ffffffffffffffff82111561031857600080fd5b60200191503681900382131561032d57600080fd5b9250929050565b8183823760009101908152919050565b60005b8381101561035f578181015183820152602001610347565b838111156101395750506000910152565b602081526000825180602084015261038f816040850160208701610344565b601f01601f19169190910160400192915050565b60006000198214156103c557634e487b7160e01b600052601160045260246000fd5b5060010190565b634e487b7160e01b600052604160045260246000fd5b6000602082840312156103f457600080fd5b815167ffffffffffffffff8082111561040c57600080fd5b818401915084601f83011261042057600080fd5b815181811115610432576104326103cc565b604051601f8201601f19908116603f0116810190838211818310171561045a5761045a6103cc565b8160405282815287602084870101111561047357600080fd5b610484836020830160208801610344565b97965050505050505056fea164736f6c634300080a000a";

type BoringBatchableConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BoringBatchableConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class BoringBatchable__factory extends ContractFactory {
  constructor(...args: BoringBatchableConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<BoringBatchable> {
    return super.deploy(overrides || {}) as Promise<BoringBatchable>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): BoringBatchable {
    return super.attach(address) as BoringBatchable;
  }
  override connect(signer: Signer): BoringBatchable__factory {
    return super.connect(signer) as BoringBatchable__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BoringBatchableInterface {
    return new utils.Interface(_abi) as BoringBatchableInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BoringBatchable {
    return new Contract(address, _abi, signerOrProvider) as BoringBatchable;
  }
}
