import { Artifact, ChainDeployment, IrmTypes, OracleTypes } from "@midas-capital/types";

import AnkrCertificateTokenPriceOracle from "../artifacts/AnkrCertificateTokenPriceOracle.json";
import BalancerLpTokenPriceOracle from "../artifacts/BalancerLpTokenPriceOracle.json";
import ChainlinkPriceOracleV2 from "../artifacts/ChainlinkPriceOracleV2.json";
import CurveLpTokenPriceOracleNoRegistry from "../artifacts/CurveLpTokenPriceOracleNoRegistry.json";
import CurveV2LpTokenPriceOracleNoRegistry from "../artifacts/CurveV2LpTokenPriceOracleNoRegistry.json";
import DiaPriceOracle from "../artifacts/DiaPriceOracle.json";
import FixedNativePriceOracle from "../artifacts/FixedNativePriceOracle.json";
import GelatoGUniPriceOracle from "../artifacts/GelatoGUniPriceOracle.json";
import MasterPriceOracle from "../artifacts/MasterPriceOracle.json";
import SimplePriceOracle from "../artifacts/SimplePriceOracle.json";
import StkBNBPriceOracle from "../artifacts/StkBNBPriceOracle.json";
import UniswapLpTokenPriceOracle from "../artifacts/UniswapLpTokenPriceOracle.json";
import UniswapTwapPriceOracleV2 from "../artifacts/UniswapTwapPriceOracleV2.json";
import UniswapTwapPriceOracleV2Root from "../artifacts/UniswapTwapPriceOracleV2Root.json";
import WhitePaperInterestRateModel from "../artifacts/WhitePaperInterestRateModel.json";

export const ARTIFACTS: Record<IrmTypes | OracleTypes | string, Artifact> = {
  AnkrCertificateTokenPriceOracle,
  BalancerLpTokenPriceOracle,
  ChainlinkPriceOracleV2,
  CurveLpTokenPriceOracleNoRegistry,
  CurveV2LpTokenPriceOracleNoRegistry,
  DiaPriceOracle,
  FixedNativePriceOracle,
  GelatoGUniPriceOracle,
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
