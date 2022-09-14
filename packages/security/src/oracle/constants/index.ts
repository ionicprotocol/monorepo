import { bsc, chapel, ganache, moonbeam, neondevnet, polygon } from "@midas-capital/chains";

import { chainLinkOracleAssetMappings as chainLinkOracleAssetMappingsBsc } from "./bsc";
import { chainLinkOracleAssetMappings as chainLinkOracleAssetMappingsMoonbeam } from "./moonbeam";
import { chainLinkOracleAssetMappings as chainLinkOracleAssetMappingsPolygon } from "./polygon";

export const chainLinkOracleAssetMappings = {
  [bsc.chainId]: chainLinkOracleAssetMappingsBsc,
  [polygon.chainId]: chainLinkOracleAssetMappingsPolygon,
  [moonbeam.chainId]: chainLinkOracleAssetMappingsMoonbeam,
};
