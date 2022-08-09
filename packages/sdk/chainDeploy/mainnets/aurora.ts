import { SupportedChains } from "@midas-capital/types";

import { chainSpecificParams } from "../../src/chainConfig";
import { ChainDeployConfig } from "../helpers";

// see https://gov.near.org/t/evm-runtime-base-token/340/24
export const deployConfig1313161554: ChainDeployConfig = {
  wtoken: "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB",
  nativeTokenName: "ETH",
  nativeTokenSymbol: "Ethereum",
  blocksPerYear: chainSpecificParams[SupportedChains.moonbase_alpha].blocksPerYear.toNumber(), // 12 second blocks, 5 blocks per minute,
  stableToken: "",
  wBTCToken: "",
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: "0x",
    uniswapV2RouterAddress: "",
    uniswapV2FactoryAddress: "",
    uniswapOracleInitialDeployTokens: [],
  },
  cgId: "ethereum",
};
