/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */

import { SupportedChains } from "@midas-capital/types";

import { chainSpecificParams } from "../../src/chainConfig";
import { ChainDeployConfig } from "../helpers";

export const deployConfig: ChainDeployConfig = {
  wtoken: "0xd0A1E359811322d97991E03f863a0C30C2cF029C", // WETH
  nativeTokenName: "Kovan (Testnet)",
  nativeTokenSymbol: "ETH",
  blocksPerYear: 15 * 24 * 365 * 60, // 4 second blocks, 15 blocks per minute
  // wBTCToken: "0x7a15c3867E3f911C5d4f9810E415E0590EcbEbe4", // WBTC
  wBTCToken: "0x1Fef22c58Cb4aD1832F5Aaae1b1A1a3EDBCC1E0B", // TT2
  // uniswapV2Pair: "0xbB0F21795d19bc297FfA6F771Cca5055D59a35eC", TT2/WETH
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: "0x",
    uniswapV2RouterAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    uniswapV2FactoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    uniswapOracleInitialDeployTokens: [],
  },
  cgId: chainSpecificParams[SupportedChains.ganache].cgId,
};

export const deploy = async ({ getNamedAccounts }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);
};
