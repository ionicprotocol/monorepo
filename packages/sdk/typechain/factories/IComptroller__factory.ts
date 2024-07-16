/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IComptroller, IComptrollerInterface } from "../IComptroller";

const _abi = [
  {
    type: "function",
    name: "_become",
    inputs: [
      {
        name: "unitroller",
        type: "address",
        internalType: "contract IUnitroller",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "_deployMarket",
    inputs: [
      {
        name: "isCEther",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "constructorData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "becomeImplData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "collateralFactorMantissa",
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "_setCloseFactor",
    inputs: [
      {
        name: "newCloseFactorMantissa",
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "_setCollateralFactor",
    inputs: [
      {
        name: "market",
        type: "address",
        internalType: "contract ICToken",
      },
      {
        name: "newCollateralFactorMantissa",
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "_setLiquidationIncentive",
    inputs: [
      {
        name: "newLiquidationIncentiveMantissa",
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "_setPriceOracle",
    inputs: [
      {
        name: "newOracle",
        type: "address",
        internalType: "contract IPriceOracle",
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
    name: "_setWhitelistEnforcement",
    inputs: [
      {
        name: "enforce",
        type: "bool",
        internalType: "bool",
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
    name: "_setWhitelistStatuses",
    inputs: [
      {
        name: "_suppliers",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "statuses",
        type: "bool[]",
        internalType: "bool[]",
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
    name: "_toggleAutoImplementations",
    inputs: [
      {
        name: "enabled",
        type: "bool",
        internalType: "bool",
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
    name: "adminHasRights",
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
    name: "autoImplementation",
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
    name: "borrowCapForCollateral",
    inputs: [
      {
        name: "borrowed",
        type: "address",
        internalType: "address",
      },
      {
        name: "collateral",
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
    name: "borrowCaps",
    inputs: [
      {
        name: "cToken",
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
    name: "borrowGuardianPaused",
    inputs: [
      {
        name: "cToken",
        type: "address",
        internalType: "address",
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
    name: "borrowingAgainstCollateralBlacklist",
    inputs: [
      {
        name: "borrowed",
        type: "address",
        internalType: "address",
      },
      {
        name: "collateral",
        type: "address",
        internalType: "address",
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
    name: "checkMembership",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "cToken",
        type: "address",
        internalType: "contract ICToken",
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
    name: "closeFactorMantissa",
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
    name: "enforceWhitelist",
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
    name: "enterMarkets",
    inputs: [
      {
        name: "cTokens",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "exitMarket",
    inputs: [
      {
        name: "cTokenAddress",
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
    name: "getAccountLiquidity",
    inputs: [
      {
        name: "account",
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
    name: "getAllBorrowers",
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
    name: "getAllMarkets",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "contract ICToken[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAssetsIn",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "contract ICToken[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getHypotheticalAccountLiquidity",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "cTokenModify",
        type: "address",
        internalType: "address",
      },
      {
        name: "redeemTokens",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "borrowAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "repayAmount",
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
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMaxRedeemOrBorrow",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "cTokenModify",
        type: "address",
        internalType: "contract ICToken",
      },
      {
        name: "isBorrow",
        type: "bool",
        internalType: "bool",
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
    name: "getRewardsDistributors",
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
    name: "getWhitelistedBorrowersBorrows",
    inputs: [
      {
        name: "cToken",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "borrowed",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getWhitelistedSuppliersSupply",
    inputs: [
      {
        name: "cToken",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "supplied",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ionicAdminHasRights",
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
    name: "isDeprecated",
    inputs: [
      {
        name: "cToken",
        type: "address",
        internalType: "contract ICToken",
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
    name: "isUserOfPool",
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
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "liquidationIncentiveMantissa",
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
    name: "markets",
    inputs: [
      {
        name: "cToken",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
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
    name: "mintGuardianPaused",
    inputs: [
      {
        name: "cToken",
        type: "address",
        internalType: "address",
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
    name: "oracle",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPriceOracle",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pauseGuardian",
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
    name: "suppliers",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
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
    name: "supplyCaps",
    inputs: [
      {
        name: "cToken",
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
    name: "whitelist",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
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
] as const;

export class IComptroller__factory {
  static readonly abi = _abi;
  static createInterface(): IComptrollerInterface {
    return new utils.Interface(_abi) as IComptrollerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IComptroller {
    return new Contract(address, _abi, signerOrProvider) as IComptroller;
  }
}
