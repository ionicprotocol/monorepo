/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPool, IPoolInterface } from "../IPool";

const _abi = [
  {
    type: "function",
    name: "factory",
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
    name: "getFeeGrowthGlobal",
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
    name: "getLiquidityState",
    inputs: [],
    outputs: [
      {
        name: "baseL",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "reinvestL",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "reinvestLLast",
        type: "uint128",
        internalType: "uint128",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPoolState",
    inputs: [],
    outputs: [
      {
        name: "sqrtP",
        type: "uint160",
        internalType: "uint160",
      },
      {
        name: "currentTick",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "nearestCurrentTick",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "locked",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPositions",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "tickLower",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "tickUpper",
        type: "int24",
        internalType: "int24",
      },
    ],
    outputs: [
      {
        name: "liquidity",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "feeGrowthInsideLast",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSecondsPerLiquidityData",
    inputs: [],
    outputs: [
      {
        name: "secondsPerLiquidityGlobal",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "lastUpdateTime",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSecondsPerLiquidityInside",
    inputs: [
      {
        name: "tickLower",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "tickUpper",
        type: "int24",
        internalType: "int24",
      },
    ],
    outputs: [
      {
        name: "secondsPerLiquidityInside",
        type: "uint128",
        internalType: "uint128",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initializedTicks",
    inputs: [
      {
        name: "tick",
        type: "int24",
        internalType: "int24",
      },
    ],
    outputs: [
      {
        name: "previous",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "next",
        type: "int24",
        internalType: "int24",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxTickLiquidity",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint128",
        internalType: "uint128",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "poolOracle",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPoolOracle",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "swapFeeUnits",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint24",
        internalType: "uint24",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tickDistance",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "int24",
        internalType: "int24",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ticks",
    inputs: [
      {
        name: "tick",
        type: "int24",
        internalType: "int24",
      },
    ],
    outputs: [
      {
        name: "liquidityGross",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "liquidityNet",
        type: "int128",
        internalType: "int128",
      },
      {
        name: "feeGrowthOutside",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "secondsPerLiquidityOutside",
        type: "uint128",
        internalType: "uint128",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "token0",
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
    name: "token1",
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
] as const;

export class IPool__factory {
  static readonly abi = _abi;
  static createInterface(): IPoolInterface {
    return new utils.Interface(_abi) as IPoolInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): IPool {
    return new Contract(address, _abi, signerOrProvider) as IPool;
  }
}