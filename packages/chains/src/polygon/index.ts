import { ChainConfig, SupportedChains } from "@midas-capital/types";

import deployments from "../../deployments/polygon.json";

import chainAddresses from "./addresses";
import assets from "./assets";
import irms from "./irms";
import liquidationDefaults from "./liquidation";
import oracles from "./oracles";
import specificParams from "./params";
import deployedPlugins from "./plugins";
import redemptionStrategies from "./redemptionStrategies";
import fundingStrategies from "./fundingStrategies";

const chainConfig: ChainConfig = {
  chainId: SupportedChains.polygon,
  chainAddresses,
  assets,
  irms,
  liquidationDefaults,
  oracles,
  specificParams,
  deployedPlugins,
  redemptionStrategies,
  fundingStrategies,
  chainDeployments: deployments.contracts,
};

export default chainConfig;
