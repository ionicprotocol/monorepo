/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  UniswapV3PriceOracle,
  UniswapV3PriceOracleInterface,
} from "../UniswapV3PriceOracle";

const _abi = [
  {
    type: "function",
    name: "SUPPORTED_BASE_TOKENS",
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
    type: "function",
    name: "WTOKEN",
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
    name: "_setSupportedBaseTokens",
    inputs: [
      {
        name: "_supportedBaseTokens",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "canAdminOverwrite",
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
    name: "getPriceX96FromSqrtPriceX96",
    inputs: [
      {
        name: "token0",
        type: "address",
        internalType: "address",
      },
      {
        name: "priceToken",
        type: "address",
        internalType: "address",
      },
      {
        name: "sqrtPriceX96",
        type: "uint160",
        internalType: "uint160",
      },
    ],
    outputs: [
      {
        name: "price_",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getSupportedBaseTokens",
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
        name: "_wtoken",
        type: "address",
        internalType: "address",
      },
      {
        name: "_supportedBaseTokens",
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
    name: "poolFeeds",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "poolAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "twapWindow",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "baseToken",
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
    name: "setPoolFeeds",
    inputs: [
      {
        name: "underlyings",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "assetConfig",
        type: "tuple[]",
        internalType:
          "struct ConcentratedLiquidityBasePriceOracle.AssetConfig[]",
        components: [
          {
            name: "poolAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "twapWindow",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "baseToken",
            type: "address",
            internalType: "address",
          },
        ],
      },
    ],
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
  "0x608060405234801561001057600080fd5b50611c20806100206000396000f3fe608060405234801561001057600080fd5b506004361061010b5760003560e01c8063946d9204116100a2578063d856737d11610071578063d856737d14610276578063e30c397814610289578063f2fde38b1461029c578063fc4d33f9146102af578063fc57d4df146102b757600080fd5b8063946d9204146101d9578063aea91078146101ec578063b92363a3146101ff578063cef109011461021257600080fd5b80636e96dfd7116100de5780636e96dfd71461018a578063715018a61461019f57806379422aba146101a75780638da5cb5b146101c857600080fd5b80630fee7bc1146101105780635bcf1f7614610140578063656b0fd1146101585780636d913a1c14610175575b600080fd5b61012361011e366004611474565b6102ca565b6040516001600160a01b0390911681526020015b60405180910390f35b6067546101239061010090046001600160a01b031681565b6067546101659060ff1681565b6040519015158152602001610137565b61017d6102f4565b604051610137919061148d565b61019d6101983660046114ef565b610356565b005b61019d6103c0565b6101ba6101b536600461150c565b610408565b604051908152602001610137565b6033546001600160a01b0316610123565b61019d6101e736600461165f565b610471565b6101ba6101fa3660046114ef565b6105b9565b61019d61020d3660046116af565b6105ca565b61024c6102203660046114ef565b6066602052600090815260409020805460018201546002909201546001600160a01b0391821692911683565b604080516001600160a01b0394851681526020810193909352921691810191909152606001610137565b61019d6102843660046117a9565b6107bb565b606554610123906001600160a01b031681565b61019d6102aa3660046114ef565b6107da565b61019d61084b565b6101ba6102c53660046114ef565b61095f565b606881815481106102da57600080fd5b6000918252602090912001546001600160a01b0316905081565b6060606880548060200260200160405190810160405280929190818152602001828054801561034c57602002820191906000526020600020905b81546001600160a01b0316815260019091019060200180831161032e575b5050505050905090565b61035e610a5b565b606580546001600160a01b038381166001600160a01b031983168117909355604080519190921680825260208201939093527fb3d55174552271a4f1aaf36b72f50381e892171636b3fb5447fe00e995e7a37b91015b60405180910390a15050565b6103c8610a5b565b60405162461bcd60e51b815260206004820152601060248201526f6e6f74207573656420616e796d6f726560801b60448201526064015b60405180910390fd5b60006104336001600160a01b0383168061042e670de0b6b3a7640000600160c01b611812565b610ab7565b9050826001600160a01b0316846001600160a01b03161461046a57610467816ec097ce7bc90715b34b9f1000000000611812565b90505b9392505050565b600054610100900460ff16158080156104915750600054600160ff909116105b806104ab5750303b1580156104ab575060005460ff166001145b61050e5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b60648201526084016103ff565b6000805460ff191660011790558015610531576000805461ff0019166101001790555b61053a33610b66565b60678054610100600160a81b0319166101006001600160a01b03861602179055815161056d9060689060208501906113fa565b5080156105b4576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b505050565b60006105c482610ba1565b92915050565b6105d2610a5b565b600082511180156105e4575080518251145b6106565760405162461bcd60e51b815260206004820152603860248201527f4c656e67746873206f6620626f746820617272617973206d757374206265206560448201527f7175616c20616e642067726561746572207468616e20302e000000000000000060648201526084016103ff565b60005b82518110156105b457600083828151811061067657610676611826565b60200260200101519050606760019054906101000a90046001600160a01b03166001600160a01b03168383815181106106b1576106b1611826565b6020026020010151604001516001600160a01b031614806106f357506106f38383815181106106e2576106e2611826565b602002602001015160400151610db2565b61073f5760405162461bcd60e51b815260206004820152601c60248201527f4261736520746f6b656e206d75737420626520737570706f727465640000000060448201526064016103ff565b82828151811061075157610751611826565b6020908102919091018101516001600160a01b03928316600090815260668352604090819020825181549086166001600160a01b031991821617825593830151600182015591015160029091018054919093169116179055806107b38161183c565b915050610659565b6107c3610a5b565b80516107d69060689060208401906113fa565b5050565b6107e2610a5b565b606554604080516001600160a01b03928316815291831660208301527fb3d55174552271a4f1aaf36b72f50381e892171636b3fb5447fe00e995e7a37b910160405180910390a1606580546001600160a01b0319166001600160a01b0392909216919091179055565b6065546001600160a01b0316331461089d5760405162461bcd60e51b81526020600482015260156024820152743737ba103a3432903832b73234b7339037bbb732b960591b60448201526064016103ff565b60006108b16033546001600160a01b031690565b6065549091506001600160a01b03166108c981610e1c565b606580546001600160a01b0319169055604080516001600160a01b0384168152600060208201527f70aea8d848e8a90fb7661b227dc522eb6395c3dac71b63cb59edd5c9899b2364910160405180910390a1606554604080516001600160a01b03808516825290921660208301527fb3d55174552271a4f1aaf36b72f50381e892171636b3fb5447fe00e995e7a37b91016103b4565b600080826001600160a01b0316636f307dc36040518163ffffffff1660e01b8152600401602060405180830381865afa1580156109a0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109c49190611857565b9050806001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610a04573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a289190611874565b610a369060ff16600a61197b565b610a3f82610ba1565b610a5190670de0b6b3a7640000611987565b61046a9190611812565b6033546001600160a01b03163314610ab55760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016103ff565b565b600080806000198587098587029250828110838203039150508060001415610af15760008411610ae657600080fd5b50829004905061046a565b808411610afd57600080fd5b60008486880960026001871981018816978890046003810283188082028403028082028403028082028403028082028403028082028403029081029092039091026000889003889004909101858311909403939093029303949094049190911702949350505050565b600054610100900460ff16610b8d5760405162461bcd60e51b81526004016103ff906119a6565b610b95610e6e565b610b9e81610e1c565b50565b604080516002808252606082018352600092839291906020830190803683375050506001600160a01b03848116600090815260666020526040812060018101546002909101548451949550909392169183918591610c0157610c01611826565b602002602001019063ffffffff16908163ffffffff1681525050600083600181518110610c3057610c30611826565b63ffffffff9092166020928302919091018201526001600160a01b0380871660009081526066909252604080832054905163883bdbfd60e01b815291169190829063883bdbfd90610c859088906004016119f1565b600060405180830381865afa158015610ca2573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610cca9190810190611a93565b50905060008482600081518110610ce357610ce3611826565b602002602001015183600181518110610cfe57610cfe611826565b6020026020010151610d109190611b55565b610d1a9190611ba5565b90506000610d2782610e9d565b90506000610d97856001600160a01b0316630dfe16816040518163ffffffff1660e01b8152600401602060405180830381865afa158015610d6c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d909190611857565b8b84610408565b9050610da4868b836111d0565b9a9950505050505050505050565b6000805b606854811015610e1357826001600160a01b031660688281548110610ddd57610ddd611826565b6000918252602090912001546001600160a01b03161415610e015750600192915050565b80610e0b8161183c565b915050610db6565b50600092915050565b603380546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b600054610100900460ff16610e955760405162461bcd60e51b81526004016103ff906119a6565b610ab56113ca565b60008060008360020b12610eb4578260020b610ebc565b8260020b6000035b9050620d89e8811115610ef55760405162461bcd60e51b81526020600482015260016024820152601560fa1b60448201526064016103ff565b600060018216610f0957600160801b610f1b565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff1690506002821615610f4f576ffff97272373d413259a46990580e213a0260801c5b6004821615610f6e576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b6008821615610f8d576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b6010821615610fac576fffcb9843d60f6159c9db58835c9266440260801c5b6020821615610fcb576fff973b41fa98c081472e6896dfb254c00260801c5b6040821615610fea576fff2ea16466c96a3843ec78b326b528610260801c5b6080821615611009576ffe5dee046a99a2a811c461f1969c30530260801c5b610100821615611029576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b610200821615611049576ff987a7253ac413176f2b074cf7815e540260801c5b610400821615611069576ff3392b0822b70005940c7a398e4b70f30260801c5b610800821615611089576fe7159475a2c29b7443b29c7fa6e889d90260801c5b6110008216156110a9576fd097f3bdfd2022b8845ad8f792aa58250260801c5b6120008216156110c9576fa9f746462d870fdf8a65dc1f90e061e50260801c5b6140008216156110e9576f70d869a156d2a1b890bb3df62baf32f70260801c5b618000821615611109576f31be135f97d08fd981231505542fcfa60260801c5b6201000082161561112a576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b6202000082161561114a576e5d6af8dedb81196699c329225ee6040260801c5b62040000821615611169576d2216e584f5fa1ea926041bedfe980260801c5b62080000821615611186576b048a170391f7dc42444e8fa20260801c5b60008460020b13156111a75780600019816111a3576111a36117e6565b0490505b6401000000008106156111bb5760016111be565b60005b60ff16602082901c0192505050919050565b600080806001600160a01b03861615806111fc57506067546001600160a01b0387811661010090920416145b1561120a5760129150611272565b856001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015611248573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061126c9190611874565b60ff1691505b6040516315d5220f60e31b81526001600160a01b0387166004820152600090339063aea9107890602401602060405180830381865afa1580156112b9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112dd9190611be3565b90506000866001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa15801561131f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113439190611874565b60ff169050808411156113765761135a8185611bfc565b61136590600a61197b565b61136f9087611812565b92506113a1565b8084101561139d576113888482611bfc565b61139390600a61197b565b61136f9087611987565b8592505b670de0b6b3a76400006113b48385611987565b6113be9190611812565b98975050505050505050565b600054610100900460ff166113f15760405162461bcd60e51b81526004016103ff906119a6565b610ab533610e1c565b82805482825590600052602060002090810192821561144f579160200282015b8281111561144f57825182546001600160a01b0319166001600160a01b0390911617825560209092019160019091019061141a565b5061145b92915061145f565b5090565b5b8082111561145b5760008155600101611460565b60006020828403121561148657600080fd5b5035919050565b6020808252825182820181905260009190848201906040850190845b818110156114ce5783516001600160a01b0316835292840192918401916001016114a9565b50909695505050505050565b6001600160a01b0381168114610b9e57600080fd5b60006020828403121561150157600080fd5b813561046a816114da565b60008060006060848603121561152157600080fd5b833561152c816114da565b9250602084013561153c816114da565b9150604084013561154c816114da565b809150509250925092565b634e487b7160e01b600052604160045260246000fd5b6040516060810167ffffffffffffffff8111828210171561159057611590611557565b60405290565b604051601f8201601f1916810167ffffffffffffffff811182821017156115bf576115bf611557565b604052919050565b600067ffffffffffffffff8211156115e1576115e1611557565b5060051b60200190565b600082601f8301126115fc57600080fd5b8135602061161161160c836115c7565b611596565b82815260059290921b8401810191818101908684111561163057600080fd5b8286015b84811015611654578035611647816114da565b8352918301918301611634565b509695505050505050565b6000806040838503121561167257600080fd5b823561167d816114da565b9150602083013567ffffffffffffffff81111561169957600080fd5b6116a5858286016115eb565b9150509250929050565b60008060408084860312156116c357600080fd5b833567ffffffffffffffff808211156116db57600080fd5b6116e7878388016115eb565b94506020915081860135818111156116fe57600080fd5b86019050601f8101871361171157600080fd5b803561171f61160c826115c7565b8181526060918202830184019184820191908a84111561173e57600080fd5b938501935b838510156117985780858c03121561175b5760008081fd5b61176361156d565b853561176e816114da565b8152858701358782015287860135611785816114da565b8189015283529384019391850191611743565b508096505050505050509250929050565b6000602082840312156117bb57600080fd5b813567ffffffffffffffff8111156117d257600080fd5b6117de848285016115eb565b949350505050565b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600082611821576118216117e6565b500490565b634e487b7160e01b600052603260045260246000fd5b6000600019821415611850576118506117fc565b5060010190565b60006020828403121561186957600080fd5b815161046a816114da565b60006020828403121561188657600080fd5b815160ff8116811461046a57600080fd5b600181815b808511156118d25781600019048211156118b8576118b86117fc565b808516156118c557918102915b93841c939080029061189c565b509250929050565b6000826118e9575060016105c4565b816118f6575060006105c4565b816001811461190c576002811461191657611932565b60019150506105c4565b60ff841115611927576119276117fc565b50506001821b6105c4565b5060208310610133831016604e8410600b8410161715611955575081810a6105c4565b61195f8383611897565b8060001904821115611973576119736117fc565b029392505050565b600061046a83836118da565b60008160001904831182151516156119a1576119a16117fc565b500290565b6020808252602b908201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960408201526a6e697469616c697a696e6760a81b606082015260800190565b6020808252825182820181905260009190848201906040850190845b818110156114ce57835163ffffffff1683529284019291840191600101611a0d565b600082601f830112611a4057600080fd5b81516020611a5061160c836115c7565b82815260059290921b84018101918181019086841115611a6f57600080fd5b8286015b84811015611654578051611a86816114da565b8352918301918301611a73565b60008060408385031215611aa657600080fd5b825167ffffffffffffffff80821115611abe57600080fd5b818501915085601f830112611ad257600080fd5b81516020611ae261160c836115c7565b82815260059290921b84018101918181019089841115611b0157600080fd5b948201945b83861015611b2f5785518060060b8114611b205760008081fd5b82529482019490820190611b06565b91880151919650909350505080821115611b4857600080fd5b506116a585828601611a2f565b60008160060b8360060b6000811281667fffffffffffff1901831281151615611b8057611b806117fc565b81667fffffffffffff018313811615611b9b57611b9b6117fc565b5090039392505050565b60008160060b8360060b80611bbc57611bbc6117e6565b667fffffffffffff19821460001982141615611bda57611bda6117fc565b90059392505050565b600060208284031215611bf557600080fd5b5051919050565b600082821015611c0e57611c0e6117fc565b50039056fea164736f6c634300080a000a";

type UniswapV3PriceOracleConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: UniswapV3PriceOracleConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class UniswapV3PriceOracle__factory extends ContractFactory {
  constructor(...args: UniswapV3PriceOracleConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<UniswapV3PriceOracle> {
    return super.deploy(overrides || {}) as Promise<UniswapV3PriceOracle>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): UniswapV3PriceOracle {
    return super.attach(address) as UniswapV3PriceOracle;
  }
  override connect(signer: Signer): UniswapV3PriceOracle__factory {
    return super.connect(signer) as UniswapV3PriceOracle__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UniswapV3PriceOracleInterface {
    return new utils.Interface(_abi) as UniswapV3PriceOracleInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UniswapV3PriceOracle {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as UniswapV3PriceOracle;
  }
}