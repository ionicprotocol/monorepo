import { bsc, chapel, ganache, moonbeam, neondevnet, polygon } from "@midas-capital/chains";

import { chainLinkOracleAssetMappings as chainLinkOracleAssetMappingsBsc } from "./bsc";

export const chainLinkOracleAssetMappings = {
  [bsc.chainId]: chainLinkOracleAssetMappingsBsc,
};
