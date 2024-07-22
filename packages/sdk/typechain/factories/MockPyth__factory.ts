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
import type { MockPyth, MockPythInterface } from "../MockPyth";

const _abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_validTimePeriod",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_singleUpdateFeeInWei",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createPriceFeedUpdateData",
    inputs: [
      {
        name: "id",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "price",
        type: "int64",
        internalType: "int64",
      },
      {
        name: "conf",
        type: "uint64",
        internalType: "uint64",
      },
      {
        name: "expo",
        type: "int32",
        internalType: "int32",
      },
      {
        name: "emaPrice",
        type: "int64",
        internalType: "int64",
      },
      {
        name: "emaConf",
        type: "uint64",
        internalType: "uint64",
      },
      {
        name: "publishTime",
        type: "uint64",
        internalType: "uint64",
      },
    ],
    outputs: [
      {
        name: "priceFeedData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getEmaPrice",
    inputs: [
      {
        name: "id",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "price",
        type: "tuple",
        internalType: "struct PythStructs.Price",
        components: [
          {
            name: "price",
            type: "int64",
            internalType: "int64",
          },
          {
            name: "conf",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "expo",
            type: "int32",
            internalType: "int32",
          },
          {
            name: "publishTime",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEmaPriceNoOlderThan",
    inputs: [
      {
        name: "id",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "age",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "price",
        type: "tuple",
        internalType: "struct PythStructs.Price",
        components: [
          {
            name: "price",
            type: "int64",
            internalType: "int64",
          },
          {
            name: "conf",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "expo",
            type: "int32",
            internalType: "int32",
          },
          {
            name: "publishTime",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEmaPriceUnsafe",
    inputs: [
      {
        name: "id",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "price",
        type: "tuple",
        internalType: "struct PythStructs.Price",
        components: [
          {
            name: "price",
            type: "int64",
            internalType: "int64",
          },
          {
            name: "conf",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "expo",
            type: "int32",
            internalType: "int32",
          },
          {
            name: "publishTime",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPrice",
    inputs: [
      {
        name: "id",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "price",
        type: "tuple",
        internalType: "struct PythStructs.Price",
        components: [
          {
            name: "price",
            type: "int64",
            internalType: "int64",
          },
          {
            name: "conf",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "expo",
            type: "int32",
            internalType: "int32",
          },
          {
            name: "publishTime",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPriceNoOlderThan",
    inputs: [
      {
        name: "id",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "age",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "price",
        type: "tuple",
        internalType: "struct PythStructs.Price",
        components: [
          {
            name: "price",
            type: "int64",
            internalType: "int64",
          },
          {
            name: "conf",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "expo",
            type: "int32",
            internalType: "int32",
          },
          {
            name: "publishTime",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPriceUnsafe",
    inputs: [
      {
        name: "id",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "price",
        type: "tuple",
        internalType: "struct PythStructs.Price",
        components: [
          {
            name: "price",
            type: "int64",
            internalType: "int64",
          },
          {
            name: "conf",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "expo",
            type: "int32",
            internalType: "int32",
          },
          {
            name: "publishTime",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUpdateFee",
    inputs: [
      {
        name: "updateData",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [
      {
        name: "feeAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getValidTimePeriod",
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
    name: "parsePriceFeedUpdates",
    inputs: [
      {
        name: "updateData",
        type: "bytes[]",
        internalType: "bytes[]",
      },
      {
        name: "priceIds",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "minPublishTime",
        type: "uint64",
        internalType: "uint64",
      },
      {
        name: "maxPublishTime",
        type: "uint64",
        internalType: "uint64",
      },
    ],
    outputs: [
      {
        name: "feeds",
        type: "tuple[]",
        internalType: "struct PythStructs.PriceFeed[]",
        components: [
          {
            name: "id",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "price",
            type: "tuple",
            internalType: "struct PythStructs.Price",
            components: [
              {
                name: "price",
                type: "int64",
                internalType: "int64",
              },
              {
                name: "conf",
                type: "uint64",
                internalType: "uint64",
              },
              {
                name: "expo",
                type: "int32",
                internalType: "int32",
              },
              {
                name: "publishTime",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "emaPrice",
            type: "tuple",
            internalType: "struct PythStructs.Price",
            components: [
              {
                name: "price",
                type: "int64",
                internalType: "int64",
              },
              {
                name: "conf",
                type: "uint64",
                internalType: "uint64",
              },
              {
                name: "expo",
                type: "int32",
                internalType: "int32",
              },
              {
                name: "publishTime",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "priceFeedExists",
    inputs: [
      {
        name: "id",
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
    name: "queryPriceFeed",
    inputs: [
      {
        name: "id",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "priceFeed",
        type: "tuple",
        internalType: "struct PythStructs.PriceFeed",
        components: [
          {
            name: "id",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "price",
            type: "tuple",
            internalType: "struct PythStructs.Price",
            components: [
              {
                name: "price",
                type: "int64",
                internalType: "int64",
              },
              {
                name: "conf",
                type: "uint64",
                internalType: "uint64",
              },
              {
                name: "expo",
                type: "int32",
                internalType: "int32",
              },
              {
                name: "publishTime",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "emaPrice",
            type: "tuple",
            internalType: "struct PythStructs.Price",
            components: [
              {
                name: "price",
                type: "int64",
                internalType: "int64",
              },
              {
                name: "conf",
                type: "uint64",
                internalType: "uint64",
              },
              {
                name: "expo",
                type: "int32",
                internalType: "int32",
              },
              {
                name: "publishTime",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "updatePriceFeeds",
    inputs: [
      {
        name: "updateData",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "updatePriceFeedsIfNecessary",
    inputs: [
      {
        name: "updateData",
        type: "bytes[]",
        internalType: "bytes[]",
      },
      {
        name: "priceIds",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "publishTimes",
        type: "uint64[]",
        internalType: "uint64[]",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "event",
    name: "BatchPriceFeedUpdate",
    inputs: [
      {
        name: "chainId",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
      {
        name: "sequenceNumber",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PriceFeedUpdate",
    inputs: [
      {
        name: "id",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "publishTime",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
      {
        name: "price",
        type: "int64",
        indexed: false,
        internalType: "int64",
      },
      {
        name: "conf",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "InsufficientFee",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidArgument",
    inputs: [],
  },
  {
    type: "error",
    name: "NoFreshUpdate",
    inputs: [],
  },
  {
    type: "error",
    name: "PriceFeedNotFound",
    inputs: [],
  },
  {
    type: "error",
    name: "PriceFeedNotFoundWithinRange",
    inputs: [],
  },
  {
    type: "error",
    name: "StalePrice",
    inputs: [],
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161123e38038061123e83398101604081905261002f9161003a565b60025560035561005e565b6000806040838503121561004d57600080fd5b505080516020909101519092909150565b6111d18061006d6000396000f3fe6080604052600436106100dd5760003560e01c8063b5dcc9111161007f578063caaf43f111610059578063caaf43f114610259578063d47eed4514610286578063e18910a3146102b4578063ef9e5e28146102c957600080fd5b8063b5dcc911146101e5578063b5ec026114610205578063b9256d281461024457600080fd5b80639474f45b116100bb5780639474f45b1461015857806396834ad31461017857806396db632714610198578063a4ae35e0146101c557600080fd5b806331d98b3f146100e25780634716e9c514610118578063711a2e2814610138575b600080fd5b3480156100ee57600080fd5b506101026100fd366004610bd8565b6102dc565b60405161010f9190610c26565b60405180910390f35b61012b610126366004610c9b565b6102f7565b60405161010f9190610d58565b34801561014457600080fd5b50610102610153366004610da7565b610519565b34801561016457600080fd5b50610102610173366004610bd8565b61055a565b34801561018457600080fd5b50610102610193366004610bd8565b610578565b3480156101a457600080fd5b506101b86101b3366004610ded565b610596565b60405161010f9190610e6c565b3480156101d157600080fd5b506101026101e0366004610da7565b610635565b3480156101f157600080fd5b50610102610200366004610bd8565b610646565b34801561021157600080fd5b50610234610220366004610bd8565b600090815260208190526040902054151590565b604051901515815260200161010f565b610257610252366004610ec1565b61065b565b005b34801561026557600080fd5b50610279610274366004610bd8565b610761565b60405161010f9190610f5a565b34801561029257600080fd5b506102a66102a1366004610f69565b61083d565b60405190815260200161010f565b3480156102c057600080fd5b506003546102a6565b6102576102d7366004610f69565b610855565b6102e4610b84565b6102f1826101e060035490565b92915050565b60606000610305888861083d565b9050803410156103275760405162976f7560e21b815260040160405180910390fd5b846001600160401b0381111561033f5761033f610faa565b60405190808252806020026020018201604052801561037857816020015b610365610bab565b81526020019060019003908161035d5790505b50915060005b8581101561050d5760005b888110156104a5578989828181106103a3576103a3610fc0565b90506020028101906103b59190610fd6565b8101906103c291906110a2565b8483815181106103d4576103d4610fc0565b60200260200101819052508787838181106103f1576103f1610fc0565b9050602002013584838151811061040a5761040a610fc0565b602002602001015160000151141561049357600084838151811061043057610430610fc0565b60200260200101516020015160600151905080876001600160401b0316111580156104645750856001600160401b03168111155b1561046f57506104a5565b6000801b85848151811061048557610485610fc0565b602090810291909101015152505b8061049d8161112d565b915050610389565b508686828181106104b8576104b8610fc0565b905060200201358382815181106104d1576104d1610fc0565b602002602001015160000151146104fb576040516345805f5d60e01b815260040160405180910390fd5b806105058161112d565b91505061037e565b50509695505050505050565b610521610b84565b61052a8361055a565b90508161053b428360600151610b5f565b11156102f157604051630cd5fa0760e11b815260040160405180910390fd5b610562610b84565b600061056d83610761565b604001519392505050565b610580610b84565b600061058b83610761565b602001519392505050565b60606105a0610bab565b8881526020808201805160078b810b90915281516001600160401b03808c1691850191909152825160038b900b6040918201819052935188831660609182018190528288018051958d900b9095528451938b169387019390935283518201949094529151909201919091525161061891839101610f5a565b604051602081830303815290604052915050979650505050505050565b61063d610b84565b61052a83610578565b61064e610b84565b6102f18261015360035490565b82811461067b5760405163a9cb9e0d60e01b815260040160405180910390fd5b60005b8381101561073f576106b685858381811061069b5761069b610fc0565b90506020020135600090815260208190526040902054151590565b158061071857508282828181106106cf576106cf610fc0565b90506020020160208101906106e49190611148565b6001600160401b031661070e86868481811061070257610702610fc0565b90506020020135610761565b6020015160600151105b1561072d576107278787610855565b50610759565b806107378161112d565b91505061067e565b50604051636f162bfd60e11b815260040160405180910390fd5b505050505050565b610769610bab565b60008281526020819052604090205461079557604051630295d7cd60e31b815260040160405180910390fd5b5060009081526020818152604091829020825160608082018552825482528451608080820187526001850154600781810b84526001600160401b03680100000000000000008084048216868b0152600160801b93849004600390810b878d015260028a015487890152888b01969096528a519485018b52858901549283900b855282041697830197909752909504900b84860152600490920154918301919091529182015290565b60025460009061084e908390611163565b9392505050565b6000610861838361083d565b9050803410156108835760405162976f7560e21b815260040160405180910390fd5b600160005b83811015610ace5760008585838181106108a4576108a4610fc0565b90506020028101906108b69190610fd6565b8101906108c391906110a2565b805160009081526020818152604090912060020154908201516060015191925090811015610ab95781600080846000015181526020019081526020016000206000820151816000015560208201518160010160008201518160000160006101000a8154816001600160401b03021916908360070b6001600160401b0316021790555060208201518160000160086101000a8154816001600160401b0302191690836001600160401b0316021790555060408201518160000160106101000a81548163ffffffff021916908360030b63ffffffff16021790555060608201518160010155505060408201518160030160008201518160000160006101000a8154816001600160401b03021916908360070b6001600160401b0316021790555060208201518160000160086101000a8154816001600160401b0302191690836001600160401b0316021790555060408201518160000160106101000a81548163ffffffff021916908360030b63ffffffff16021790555060608201518160010155505090505081600001517fd06a6b7f4918494b3719217d1802786c1f5112a6c1d88fe2cfec00b4584f6aec82846020015160000151856020015160200151604051610ab0939291906001600160401b03938416815260079290920b6020830152909116604082015260600190565b60405180910390a25b50508080610ac69061112d565b915050610888565b506001546040805161ffff841681526001600160401b0390921660208301527f943f0e8a16c19895fb87cbeb1a349ed86d7f31923089dd36c1a1ed5e300f267b910160405180910390a1600180548190600090610b359083906001600160401b0316611182565b92506101000a8154816001600160401b0302191690836001600160401b0316021790555050505050565b600081831115610b7a57610b7382846111ad565b90506102f1565b610b7383836111ad565b60408051608081018252600080825260208201819052918101829052606081019190915290565b60408051606081019091526000815260208101610bc6610b84565b8152602001610bd3610b84565b905290565b600060208284031215610bea57600080fd5b5035919050565b805160070b82526001600160401b036020820151166020830152604081015160030b6040830152606081015160608301525050565b608081016102f18284610bf1565b60008083601f840112610c4657600080fd5b5081356001600160401b03811115610c5d57600080fd5b6020830191508360208260051b8501011115610c7857600080fd5b9250929050565b80356001600160401b0381168114610c9657600080fd5b919050565b60008060008060008060808789031215610cb457600080fd5b86356001600160401b0380821115610ccb57600080fd5b610cd78a838b01610c34565b90985096506020890135915080821115610cf057600080fd5b50610cfd89828a01610c34565b9095509350610d10905060408801610c7f565b9150610d1e60608801610c7f565b90509295509295509295565b805182526020810151610d406020840182610bf1565b506040810151610d5360a0840182610bf1565b505050565b6020808252825182820181905260009190848201906040850190845b81811015610d9b57610d87838551610d2a565b928401926101209290920191600101610d74565b50909695505050505050565b60008060408385031215610dba57600080fd5b50508035926020909101359150565b8035600781900b8114610c9657600080fd5b8035600381900b8114610c9657600080fd5b600080600080600080600060e0888a031215610e0857600080fd5b87359650610e1860208901610dc9565b9550610e2660408901610c7f565b9450610e3460608901610ddb565b9350610e4260808901610dc9565b9250610e5060a08901610c7f565b9150610e5e60c08901610c7f565b905092959891949750929550565b600060208083528351808285015260005b81811015610e9957858101830151858201604001528201610e7d565b81811115610eab576000604083870101525b50601f01601f1916929092016040019392505050565b60008060008060008060608789031215610eda57600080fd5b86356001600160401b0380821115610ef157600080fd5b610efd8a838b01610c34565b90985096506020890135915080821115610f1657600080fd5b610f228a838b01610c34565b90965094506040890135915080821115610f3b57600080fd5b50610f4889828a01610c34565b979a9699509497509295939492505050565b61012081016102f18284610d2a565b60008060208385031215610f7c57600080fd5b82356001600160401b03811115610f9257600080fd5b610f9e85828601610c34565b90969095509350505050565b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b6000808335601e19843603018112610fed57600080fd5b8301803591506001600160401b0382111561100757600080fd5b602001915036819003821315610c7857600080fd5b60006080828403121561102e57600080fd5b604051608081018181106001600160401b038211171561105e57634e487b7160e01b600052604160045260246000fd5b60405290508061106d83610dc9565b815261107b60208401610c7f565b602082015261108c60408401610ddb565b6040820152606083013560608201525092915050565b600061012082840312156110b557600080fd5b604051606081018181106001600160401b03821117156110e557634e487b7160e01b600052604160045260246000fd5b604052823581526110f9846020850161101c565b602082015261110b8460a0850161101c565b60408201529392505050565b634e487b7160e01b600052601160045260246000fd5b600060001982141561114157611141611117565b5060010190565b60006020828403121561115a57600080fd5b61084e82610c7f565b600081600019048311821515161561117d5761117d611117565b500290565b60006001600160401b038083168185168083038211156111a4576111a4611117565b01949350505050565b6000828210156111bf576111bf611117565b50039056fea164736f6c634300080a000a";

type MockPythConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockPythConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockPyth__factory extends ContractFactory {
  constructor(...args: MockPythConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _validTimePeriod: BigNumberish,
    _singleUpdateFeeInWei: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<MockPyth> {
    return super.deploy(
      _validTimePeriod,
      _singleUpdateFeeInWei,
      overrides || {}
    ) as Promise<MockPyth>;
  }
  override getDeployTransaction(
    _validTimePeriod: BigNumberish,
    _singleUpdateFeeInWei: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _validTimePeriod,
      _singleUpdateFeeInWei,
      overrides || {}
    );
  }
  override attach(address: string): MockPyth {
    return super.attach(address) as MockPyth;
  }
  override connect(signer: Signer): MockPyth__factory {
    return super.connect(signer) as MockPyth__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockPythInterface {
    return new utils.Interface(_abi) as MockPythInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockPyth {
    return new Contract(address, _abi, signerOrProvider) as MockPyth;
  }
}
