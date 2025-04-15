import deployments from "@ionicprotocol/sdk/deployments/metalL2.json";
import { ChainConfig, SupportedChains } from "@ionicprotocol/types";

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
  chainId: SupportedChains.metalL2,
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
