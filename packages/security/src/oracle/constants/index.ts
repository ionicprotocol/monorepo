import { arbitrum, bsc, chapel, ganache, moonbeam, neondevnet, polygon } from "@ionicprotocol/chains";

import { uniswapV3OracleAssetMappings as uniswapV3OracleAssetMappingsArbitrum } from "./arbitrum";
import { chainLinkOracleAssetMappings as chainLinkOracleAssetMappingsBsc } from "./bsc";
import { chainLinkOracleAssetMappings as chainLinkOracleAssetMappingsMoonbeam } from "./moonbeam";
import { chainLinkOracleAssetMappings as chainLinkOracleAssetMappingsPolygon } from "./polygon";

export const chainLinkOracleAssetMappings = {
  [bsc.chainId]: chainLinkOracleAssetMappingsBsc,
  [polygon.chainId]: chainLinkOracleAssetMappingsPolygon,
  [moonbeam.chainId]: chainLinkOracleAssetMappingsMoonbeam,
};

export const uniswapV3OracleAssetMappings = {
  [arbitrum.chainId]: uniswapV3OracleAssetMappingsArbitrum,
};
