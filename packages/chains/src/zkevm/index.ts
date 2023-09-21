import { ChainConfig, SupportedChains } from "@ionicprotocol/types";

import deployments from "../../deployments/zkevm.json";

import chainAddresses from "./addresses";
import { assets } from "./assets";
import fundingStrategies from "./fundingStrategies";
import irms from "./irms";
import leveragePairs from "./leveragePairs";
import liquidationDefaults from "./liquidation";
import oracles from "./oracles";
import specificParams from "./params";
import deployedPlugins from "./plugins";
import redemptionStrategies from "./redemptionStrategies";

const chainConfig: ChainConfig = {
  chainId: SupportedChains.zkevm,
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
  leveragePairs
};

export default chainConfig;
