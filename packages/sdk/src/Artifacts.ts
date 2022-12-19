import { Artifact, ChainDeployment, IrmTypes, OracleTypes } from "@midas-capital/types";

import AdjustableJumpRateModel from "../artifacts/AdjustableJumpRateModel.json";
import AnkrBNBInterestRateModel from "../artifacts/AnkrBNBInterestRateModel.json";
import AnkrCertificateTokenPriceOracle from "../artifacts/AnkrCertificateTokenPriceOracle.json";
import BalancerLpTokenPriceOracle from "../artifacts/BalancerLpTokenPriceOracle.json";
import ChainlinkPriceOracleV2 from "../artifacts/ChainlinkPriceOracleV2.json";
import CurveLpTokenPriceOracleNoRegistry from "../artifacts/CurveLpTokenPriceOracleNoRegistry.json";
import DAIInterestRateModelV2 from "../artifacts/DAIInterestRateModelV2.json";
import DiaPriceOracle from "../artifacts/DiaPriceOracle.json";
import FixedNativePriceOracle from "../artifacts/FixedNativePriceOracle.json";
import GelatoGUniPriceOracle from "../artifacts/GelatoGUniPriceOracle.json";
import JumpRateModel from "../artifacts/JumpRateModel.json";
import MasterPriceOracle from "../artifacts/MasterPriceOracle.json";
import SimplePriceOracle from "../artifacts/SimplePriceOracle.json";
import StkBNBPriceOracle from "../artifacts/StkBNBPriceOracle.json";
import UniswapLpTokenPriceOracle from "../artifacts/UniswapLpTokenPriceOracle.json";
import UniswapTwapPriceOracleV2 from "../artifacts/UniswapTwapPriceOracleV2.json";
import UniswapTwapPriceOracleV2Root from "../artifacts/UniswapTwapPriceOracleV2Root.json";
import WhitePaperInterestRateModel from "../artifacts/WhitePaperInterestRateModel.json";

const AdjustableJumpRateModel_PSTAKE_WBNB: Artifact = AdjustableJumpRateModel;
const AdjustableJumpRateModel_MIXBYTES_XCDOT: Artifact = AdjustableJumpRateModel;
const AdjustableJumpRateModel_TRANSFERO_BRZ: Artifact = AdjustableJumpRateModel;
const AdjustableJumpRateModel_TRANSFERO_BTCB_ETH_MAI_WBNB: Artifact = AdjustableJumpRateModel;
const AdjustableJumpRateModel_STADER_WBNB: Artifact = AdjustableJumpRateModel;
const AdjustableJumpRateModel_MIXBYTES_USDC: Artifact = AdjustableJumpRateModel;
const AdjustableJumpRateModel_JARVIS_jBRL: Artifact = AdjustableJumpRateModel;
const AdjustableJumpRateModel_JARVIS_jEUR: Artifact = AdjustableJumpRateModel;
const JumpRateModel_MIMO_002_004_4_08: Artifact = JumpRateModel;
const JumpRateModel_JARVIS_002_004_4_08: Artifact = JumpRateModel;

const ARTIFACTS: Record<IrmTypes | OracleTypes | string, Artifact> = {
  AdjustableJumpRateModel_JARVIS_jBRL,
  AdjustableJumpRateModel_JARVIS_jEUR,
  AdjustableJumpRateModel_MIXBYTES_USDC,
  AdjustableJumpRateModel_MIXBYTES_XCDOT,
  AdjustableJumpRateModel_PSTAKE_WBNB,
  AdjustableJumpRateModel_STADER_WBNB,
  AdjustableJumpRateModel_TRANSFERO_BRZ,
  AdjustableJumpRateModel_TRANSFERO_BTCB_ETH_MAI_WBNB,
  AdjustableJumpRateModel,
  AnkrBNBInterestRateModel,
  AnkrCertificateTokenPriceOracle,
  BalancerLpTokenPriceOracle,
  ChainlinkPriceOracleV2,
  CurveLpTokenPriceOracleNoRegistry,
  DAIInterestRateModelV2,
  DiaPriceOracle,
  FixedNativePriceOracle,
  GelatoGUniPriceOracle,
  JumpRateModel_JARVIS_002_004_4_08,
  JumpRateModel_MIMO_002_004_4_08,
  MasterPriceOracle,
  SimplePriceOracle,
  StkBNBPriceOracle,
  UniswapLpTokenPriceOracle,
  UniswapTwapPriceOracleV2,
  UniswapTwapPriceOracleV2Root,
  WhitePaperInterestRateModel,
};

export type Artifacts = typeof ARTIFACTS;
export default ARTIFACTS;

export const oracleConfig = (
  deployments: ChainDeployment,
  artifacts: Artifacts,
  availableOracles: Array<keyof Artifacts>
) => {
  const asMap = new Map(availableOracles.map((o) => [o, { abi: artifacts[o].abi, address: deployments[o].address }]));
  return Object.fromEntries(asMap);
};

export const irmConfig = (
  deployments: ChainDeployment,
  artifacts: Artifacts,
  availableIrms: Array<keyof Artifacts>
) => {
  const asMap = new Map(availableIrms.map((o) => [o, { abi: artifacts[o].abi, address: deployments[o].address }]));
  return Object.fromEntries(asMap);
};
