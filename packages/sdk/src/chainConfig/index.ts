import { Artifacts, ChainDeployment } from "../types";

export { default as chainSpecificAddresses } from "./addresses";
export { default as chainOracles } from "./oracles";
export { default as chainIrms } from "./irms";
export { default as chainSpecificParams } from "./params";
export { default as chainDeployedPlugins } from "./plugins";
export { default as chainRedemptionStrategies } from "./redemptionStrategies";
export { default as chainLiquidationDefaults } from "./liquidation";
export { default as chainSupportedAssets } from "./supportedAssets";
export { default as assetSymbols } from "./assets/assetSymbols";

export const oracleConfig = (deployments: ChainDeployment, artifacts: Artifacts, availableOracles: Array<string>) => {
  const asMap = new Map(availableOracles.map((o) => [o, { abi: artifacts[o].abi, address: deployments[o].address }]));
  return Object.fromEntries(asMap);
};

export const irmConfig = (deployments: ChainDeployment, artifacts: Artifacts, availableIrms: Array<string>) => {
  const asMap = new Map(availableIrms.map((o) => [o, { abi: artifacts[o].abi, address: deployments[o].address }]));
  return Object.fromEntries(asMap);
};
