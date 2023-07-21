import { arbitrum, bsc, polygon } from "@ionicprotocol/chains";

import { uniswapV3OracleAssetMappings as uniswapV3OracleAssetMappingsArbitrum } from "./arbitrum";
import { chainLinkOracleAssetMappings as chainLinkOracleAssetMappingsBsc } from "./bsc";
import { chainLinkOracleAssetMappings as chainLinkOracleAssetMappingsPolygon } from "./polygon";

export const chainLinkOracleAssetMappings = {
  [bsc.chainId]: chainLinkOracleAssetMappingsBsc,
  [polygon.chainId]: chainLinkOracleAssetMappingsPolygon,
};

export const uniswapV3OracleAssetMappings = {
  [arbitrum.chainId]: uniswapV3OracleAssetMappingsArbitrum,
};
