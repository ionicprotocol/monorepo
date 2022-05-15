import { Artifacts, ChainDeployment } from "../Fuse/types";

export { default as chainSpecificAddresses } from "./addresses";
export { default as chainOracles } from "./oracles";
export { default as chainSpecificParams } from "./params";
export { default as chainPluginConfig } from "./plugin";
export { default as redemptionStrategies } from "./redemptionStrategies";
export { default as liquidationDefaults } from "./liquidation";

export enum SupportedChains {
  bsc = 56,
  chapel = 97,
  ganache = 1337,
  aurora = 1313161555,
  evmos = 9001,
  evmos_testnet = 9000,
  moonbeam = 1284,
  moonbase_alpha = 1287,
}

export const oracleConfig = (
  deployments: ChainDeployment,
  artifacts: Artifacts,
  availableOracles: Array<string>
) => {
  const asMap = new Map(
    availableOracles.map((o) => [
      o,
      { artifact: artifacts[o], address: deployments[o].address },
    ])
  );
  return Object.fromEntries(asMap);
};

export const irmConfig = (
  deployments: ChainDeployment,
  artifacts: Artifacts
) => {
  return {
    JumpRateModel: {
      artifact: artifacts.JumpRateModel,
      address: deployments.JumpRateModel.address,
    },
    WhitePaperInterestRateModel: {
      artifact: artifacts.WhitePaperInterestRateModel,
      address: deployments.WhitePaperInterestRateModel.address,
    },
  };
};
