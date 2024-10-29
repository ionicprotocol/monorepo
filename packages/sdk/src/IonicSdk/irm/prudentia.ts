import { Address, parseUnits } from "viem";
import { mode } from "viem/chains";

export const CONTRACT_ADDRESS_SLOPED_IR_COMPUTER: Record<number, Address> = {
  [mode.id]: "0x786881A6d1d3337d51c5bE56362452A4F265CB68"
};
export const CONTRACT_ADDRESS_PID_COMPUTER: Record<number, Address> = {
  [mode.id]: "0xC40753877CfeF6f50E13695395c58357505719F8"
};
export const TOKEN_ADDRESS = "0xf0f161fda2712db8b566946122a5af183995e2ed";
export const RATE_DECIMALS = 18;
export const PREDICTIVE_UTILIZATION_RATE = parseUnits("0.99", RATE_DECIMALS);

export const prudentiaSlopedIRComputerAbi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name_",
        type: "string"
      },
      {
        components: [
          {
            internalType: "contract IOracle",
            name: "oracle",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "dataSlot",
            type: "uint256"
          },
          {
            internalType: "uint32",
            name: "defaultOneXScalar",
            type: "uint32"
          },
          {
            internalType: "int8",
            name: "decimalsOffset",
            type: "int8"
          }
        ],
        internalType: "struct AdrastiaPrudentiaSlopedOracleMutationComputer.OracleMutationComputerParams",
        name: "params",
        type: "tuple"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "input",
        type: "uint256"
      }
    ],
    name: "InputValueTooLarge",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "InvalidConfig",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "slot",
        type: "uint256"
      }
    ],
    name: "InvalidDataSlot",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "InvalidInput",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "oneXScalar",
        type: "uint32"
      }
    ],
    name: "InvalidOneXScalar",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "InvalidSlopeConfig",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "MissingConfig",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "MissingSlopeConfig",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "SlopeConfigNotChanged",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        components: [
          {
            internalType: "uint64",
            name: "max",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "min",
            type: "uint64"
          },
          {
            internalType: "int64",
            name: "offset",
            type: "int64"
          },
          {
            internalType: "uint32",
            name: "scalar",
            type: "uint32"
          }
        ],
        indexed: false,
        internalType: "struct MutatedValueComputer.Config",
        name: "oldConfig",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "uint64",
            name: "max",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "min",
            type: "uint64"
          },
          {
            internalType: "int64",
            name: "offset",
            type: "int64"
          },
          {
            internalType: "uint32",
            name: "scalar",
            type: "uint32"
          }
        ],
        indexed: false,
        internalType: "struct MutatedValueComputer.Config",
        name: "newConfig",
        type: "tuple"
      }
    ],
    name: "ConfigUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32"
      }
    ],
    name: "RoleAdminChanged",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "RoleGranted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "RoleRevoked",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        components: [
          {
            internalType: "int128",
            name: "base",
            type: "int128"
          },
          {
            internalType: "int64",
            name: "baseSlope",
            type: "int64"
          },
          {
            internalType: "int64",
            name: "kinkSlope",
            type: "int64"
          },
          {
            internalType: "uint128",
            name: "kink",
            type: "uint128"
          }
        ],
        indexed: false,
        internalType: "struct SlopedOracleMutationComputer.SlopeConfig",
        name: "oldConfig",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "int128",
            name: "base",
            type: "int128"
          },
          {
            internalType: "int64",
            name: "baseSlope",
            type: "int64"
          },
          {
            internalType: "int64",
            name: "kinkSlope",
            type: "int64"
          },
          {
            internalType: "uint128",
            name: "kink",
            type: "uint128"
          }
        ],
        indexed: false,
        internalType: "struct SlopedOracleMutationComputer.SlopeConfig",
        name: "newConfig",
        type: "tuple"
      }
    ],
    name: "SlopeConfigUpdated",
    type: "event"
  },
  {
    inputs: [],
    name: "ADRASTIA_CORE_VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "ADRASTIA_PERIPHERY_VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "ADRASTIA_PROTOCOL_VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "DATA_SLOT_LIQUIDITY_QUOTETOKEN",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "DATA_SLOT_LIQUIDITY_TOKEN",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "DATA_SLOT_PRICE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "computeRate",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "dataSlot",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimalsOffset",
    outputs: [
      {
        internalType: "int8",
        name: "",
        type: "int8"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "defaultDecimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "defaultOneXScalar",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "getConfig",
    outputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "max",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "min",
            type: "uint64"
          },
          {
            internalType: "int64",
            name: "offset",
            type: "int64"
          },
          {
            internalType: "uint32",
            name: "scalar",
            type: "uint32"
          }
        ],
        internalType: "struct MutatedValueComputer.Config",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      }
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256"
      }
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      }
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "getSlopeConfig",
    outputs: [
      {
        components: [
          {
            internalType: "int128",
            name: "base",
            type: "int128"
          },
          {
            internalType: "int64",
            name: "baseSlope",
            type: "int64"
          },
          {
            internalType: "int64",
            name: "kinkSlope",
            type: "int64"
          },
          {
            internalType: "uint128",
            name: "kink",
            type: "uint128"
          }
        ],
        internalType: "struct SlopedOracleMutationComputer.SlopeConfig",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "oracle",
    outputs: [
      {
        internalType: "contract IOracle",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint64",
        name: "max",
        type: "uint64"
      },
      {
        internalType: "uint64",
        name: "min",
        type: "uint64"
      },
      {
        internalType: "int64",
        name: "offset",
        type: "int64"
      },
      {
        internalType: "uint32",
        name: "scalar",
        type: "uint32"
      }
    ],
    name: "setConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "int128",
        name: "base",
        type: "int128"
      },
      {
        internalType: "int64",
        name: "baseSlope",
        type: "int64"
      },
      {
        internalType: "uint128",
        name: "kink",
        type: "uint128"
      },
      {
        internalType: "int64",
        name: "kinkSlope",
        type: "int64"
      }
    ],
    name: "setSlopeConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4"
      }
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const prudentiaPidComputerAbi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name_",
        type: "string"
      },
      {
        components: [
          {
            internalType: "address",
            name: "comptroller",
            type: "address"
          },
          {
            internalType: "contract ILiquidityOracle",
            name: "inputAndErrorOracle",
            type: "address"
          },
          {
            internalType: "uint32",
            name: "period",
            type: "uint32"
          },
          {
            internalType: "uint8",
            name: "initialBufferCardinality",
            type: "uint8"
          },
          {
            internalType: "bool",
            name: "updatersMustBeEoa",
            type: "bool"
          }
        ],
        internalType: "struct AdrastiaIonicPidController.IonicPidControllerParams",
        name: "params",
        type: "tuple"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "BufferAlreadyInitialized",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "CTokenNotFound",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "currentCapacity",
        type: "uint256"
      }
    ],
    name: "CapacityCannotBeDecreased",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "maxCapacity",
        type: "uint256"
      }
    ],
    name: "CapacityTooLarge",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "contract ILiquidityOracle",
        name: "oracle",
        type: "address"
      }
    ],
    name: "DefaultInputAndErrorOracleUnchanged",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "cToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "errorCode",
        type: "uint256"
      }
    ],
    name: "FailedToAccrueInterest",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "size",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minSizeRequired",
        type: "uint256"
      }
    ],
    name: "InsufficientData",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "InvalidConfig",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "size",
        type: "uint256"
      }
    ],
    name: "InvalidIndex",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "contract ILiquidityOracle",
        name: "oracle",
        type: "address"
      }
    ],
    name: "InvalidInputAndErrorOracle",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "period",
        type: "uint256"
      }
    ],
    name: "InvalidPeriod",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "MissingConfig",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "MissingPidConfig",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "requiredRole",
        type: "bytes32"
      }
    ],
    name: "MissingRole",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "bool",
        name: "paused",
        type: "bool"
      }
    ],
    name: "PauseStatusUnchanged",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "txOrigin",
        type: "address"
      },
      {
        internalType: "address",
        name: "updater",
        type: "address"
      }
    ],
    name: "UpdaterMustBeEoa",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract ILiquidityOracle",
        name: "oldOracle",
        type: "address"
      },
      {
        indexed: true,
        internalType: "contract ILiquidityOracle",
        name: "newOracle",
        type: "address"
      }
    ],
    name: "DefaultInputAndErrorOracleUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        indexed: false,
        internalType: "bool",
        name: "areUpdatesPaused",
        type: "bool"
      }
    ],
    name: "PauseStatusChanged",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        components: [
          {
            internalType: "contract ILiquidityOracle",
            name: "inputAndErrorOracle",
            type: "address"
          },
          {
            internalType: "int32",
            name: "kPNumerator",
            type: "int32"
          },
          {
            internalType: "uint32",
            name: "kPDenominator",
            type: "uint32"
          },
          {
            internalType: "int32",
            name: "kINumerator",
            type: "int32"
          },
          {
            internalType: "uint32",
            name: "kIDenominator",
            type: "uint32"
          },
          {
            internalType: "int32",
            name: "kDNumerator",
            type: "int32"
          },
          {
            internalType: "uint32",
            name: "kDDenominator",
            type: "uint32"
          },
          {
            internalType: "contract IInputAndErrorTransformer",
            name: "transformer",
            type: "address"
          },
          {
            internalType: "bool",
            name: "proportionalOnMeasurement",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "derivativeOnMeasurement",
            type: "bool"
          }
        ],
        indexed: false,
        internalType: "struct PidController.PidConfig",
        name: "oldConfig",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "contract ILiquidityOracle",
            name: "inputAndErrorOracle",
            type: "address"
          },
          {
            internalType: "int32",
            name: "kPNumerator",
            type: "int32"
          },
          {
            internalType: "uint32",
            name: "kPDenominator",
            type: "uint32"
          },
          {
            internalType: "int32",
            name: "kINumerator",
            type: "int32"
          },
          {
            internalType: "uint32",
            name: "kIDenominator",
            type: "uint32"
          },
          {
            internalType: "int32",
            name: "kDNumerator",
            type: "int32"
          },
          {
            internalType: "uint32",
            name: "kDDenominator",
            type: "uint32"
          },
          {
            internalType: "contract IInputAndErrorTransformer",
            name: "transformer",
            type: "address"
          },
          {
            internalType: "bool",
            name: "proportionalOnMeasurement",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "derivativeOnMeasurement",
            type: "bool"
          }
        ],
        indexed: false,
        internalType: "struct PidController.PidConfig",
        name: "newConfig",
        type: "tuple"
      }
    ],
    name: "PidConfigUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        components: [
          {
            internalType: "uint64",
            name: "max",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "min",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "maxIncrease",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "maxDecrease",
            type: "uint64"
          },
          {
            internalType: "uint32",
            name: "maxPercentIncrease",
            type: "uint32"
          },
          {
            internalType: "uint16",
            name: "maxPercentDecrease",
            type: "uint16"
          },
          {
            internalType: "uint64",
            name: "base",
            type: "uint64"
          },
          {
            internalType: "uint16[]",
            name: "componentWeights",
            type: "uint16[]"
          },
          {
            internalType: "contract IRateComputer[]",
            name: "components",
            type: "address[]"
          }
        ],
        indexed: false,
        internalType: "struct RateController.RateConfig",
        name: "oldConfig",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "uint64",
            name: "max",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "min",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "maxIncrease",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "maxDecrease",
            type: "uint64"
          },
          {
            internalType: "uint32",
            name: "maxPercentIncrease",
            type: "uint32"
          },
          {
            internalType: "uint16",
            name: "maxPercentDecrease",
            type: "uint16"
          },
          {
            internalType: "uint64",
            name: "base",
            type: "uint64"
          },
          {
            internalType: "uint16[]",
            name: "componentWeights",
            type: "uint16[]"
          },
          {
            internalType: "contract IRateComputer[]",
            name: "components",
            type: "address[]"
          }
        ],
        indexed: false,
        internalType: "struct RateController.RateConfig",
        name: "newConfig",
        type: "tuple"
      }
    ],
    name: "RateConfigUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "target",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "current",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "RatePushedManually",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "target",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "current",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256"
      }
    ],
    name: "RateUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oldCapacity",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newCapacity",
        type: "uint256"
      }
    ],
    name: "RatesCapacityIncreased",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "capacity",
        type: "uint256"
      }
    ],
    name: "RatesCapacityInitialized",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32"
      }
    ],
    name: "RoleAdminChanged",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "RoleGranted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "RoleRevoked",
    type: "event"
  },
  {
    inputs: [],
    name: "ADRASTIA_CORE_VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "ADRASTIA_PERIPHERY_VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "ADRASTIA_PROTOCOL_VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "ERROR_ZERO",
    outputs: [
      {
        internalType: "uint112",
        name: "",
        type: "uint112"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "areUpdatesPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "canComputeNextRate",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "canUpdate",
    outputs: [
      {
        internalType: "bool",
        name: "b",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "comptroller",
    outputs: [
      {
        internalType: "contract IComptroller",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "computeRate",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "defaultInputAndErrorOracle",
    outputs: [
      {
        internalType: "contract ILiquidityOracle",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "getConfig",
    outputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "max",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "min",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "maxIncrease",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "maxDecrease",
            type: "uint64"
          },
          {
            internalType: "uint32",
            name: "maxPercentIncrease",
            type: "uint32"
          },
          {
            internalType: "uint16",
            name: "maxPercentDecrease",
            type: "uint16"
          },
          {
            internalType: "uint64",
            name: "base",
            type: "uint64"
          },
          {
            internalType: "uint16[]",
            name: "componentWeights",
            type: "uint16[]"
          },
          {
            internalType: "contract IRateComputer[]",
            name: "components",
            type: "address[]"
          }
        ],
        internalType: "struct RateController.RateConfig",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "getInputAndErrorOracle",
    outputs: [
      {
        internalType: "contract ILiquidityOracle",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256"
      }
    ],
    name: "getRateAt",
    outputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "target",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "current",
            type: "uint64"
          },
          {
            internalType: "uint32",
            name: "timestamp",
            type: "uint32"
          }
        ],
        internalType: "struct RateLibrary.Rate",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "offset",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "increment",
        type: "uint256"
      }
    ],
    name: "getRates",
    outputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "target",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "current",
            type: "uint64"
          },
          {
            internalType: "uint32",
            name: "timestamp",
            type: "uint32"
          }
        ],
        internalType: "struct RateLibrary.Rate[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "getRates",
    outputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "target",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "current",
            type: "uint64"
          },
          {
            internalType: "uint32",
            name: "timestamp",
            type: "uint32"
          }
        ],
        internalType: "struct RateLibrary.Rate[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "getRatesCapacity",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "getRatesCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      }
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256"
      }
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      }
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "granularity",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "lastUpdateTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint64",
        name: "target",
        type: "uint64"
      },
      {
        internalType: "uint64",
        name: "current",
        type: "uint64"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "manuallyPushRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "needsUpdate",
    outputs: [
      {
        internalType: "bool",
        name: "b",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "period",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "pidData",
    outputs: [
      {
        components: [
          {
            internalType: "contract ILiquidityOracle",
            name: "inputAndErrorOracle",
            type: "address"
          },
          {
            internalType: "int32",
            name: "kPNumerator",
            type: "int32"
          },
          {
            internalType: "uint32",
            name: "kPDenominator",
            type: "uint32"
          },
          {
            internalType: "int32",
            name: "kINumerator",
            type: "int32"
          },
          {
            internalType: "uint32",
            name: "kIDenominator",
            type: "uint32"
          },
          {
            internalType: "int32",
            name: "kDNumerator",
            type: "int32"
          },
          {
            internalType: "uint32",
            name: "kDDenominator",
            type: "uint32"
          },
          {
            internalType: "contract IInputAndErrorTransformer",
            name: "transformer",
            type: "address"
          },
          {
            internalType: "bool",
            name: "proportionalOnMeasurement",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "derivativeOnMeasurement",
            type: "bool"
          }
        ],
        internalType: "struct PidController.PidConfig",
        name: "config",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "int256",
            name: "iTerm",
            type: "int256"
          },
          {
            internalType: "int256",
            name: "lastInput",
            type: "int256"
          },
          {
            internalType: "int256",
            name: "lastError",
            type: "int256"
          }
        ],
        internalType: "struct PidController.PidState",
        name: "state",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        components: [
          {
            internalType: "uint64",
            name: "max",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "min",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "maxIncrease",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "maxDecrease",
            type: "uint64"
          },
          {
            internalType: "uint32",
            name: "maxPercentIncrease",
            type: "uint32"
          },
          {
            internalType: "uint16",
            name: "maxPercentDecrease",
            type: "uint16"
          },
          {
            internalType: "uint64",
            name: "base",
            type: "uint64"
          },
          {
            internalType: "uint16[]",
            name: "componentWeights",
            type: "uint16[]"
          },
          {
            internalType: "contract IRateComputer[]",
            name: "components",
            type: "address[]"
          }
        ],
        internalType: "struct RateController.RateConfig",
        name: "config",
        type: "tuple"
      }
    ],
    name: "setConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract ILiquidityOracle",
        name: "inputAndErrorOracle_",
        type: "address"
      }
    ],
    name: "setDefaultInputAndErrorOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        components: [
          {
            internalType: "contract ILiquidityOracle",
            name: "inputAndErrorOracle",
            type: "address"
          },
          {
            internalType: "int32",
            name: "kPNumerator",
            type: "int32"
          },
          {
            internalType: "uint32",
            name: "kPDenominator",
            type: "uint32"
          },
          {
            internalType: "int32",
            name: "kINumerator",
            type: "int32"
          },
          {
            internalType: "uint32",
            name: "kIDenominator",
            type: "uint32"
          },
          {
            internalType: "int32",
            name: "kDNumerator",
            type: "int32"
          },
          {
            internalType: "uint32",
            name: "kDDenominator",
            type: "uint32"
          },
          {
            internalType: "contract IInputAndErrorTransformer",
            name: "transformer",
            type: "address"
          },
          {
            internalType: "bool",
            name: "proportionalOnMeasurement",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "derivativeOnMeasurement",
            type: "bool"
          }
        ],
        internalType: "struct PidController.PidConfig",
        name: "pidConfig",
        type: "tuple"
      }
    ],
    name: "setPidConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "setRatesCapacity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "bool",
        name: "paused",
        type: "bool"
      }
    ],
    name: "setUpdatesPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4"
      }
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "timeSinceLastUpdate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "update",
    outputs: [
      {
        internalType: "bool",
        name: "b",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "updatersMustBeEoa",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;
