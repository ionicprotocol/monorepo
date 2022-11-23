import { Artifact, ChainDeployment } from "@midas-capital/types";

import AdjustableJumpRateModelArtifact from "@artifacts/AdjustableJumpRateModel.json";
import AnkrBNBcPriceOracleArtifact from "@artifacts/AnkrBNBcPriceOracle.json";
import AnkrBNBInterestRateModelArtifact from "@artifacts/AnkrBNBInterestRateModel.json";
import BalancerLpTokenPriceOracleArtifact from "@artifacts/BalancerLpTokenPriceOracle.json";
import BNBxPriceOracleArtifact from "@artifacts/BNBxPriceOracle.json";
import CErc20DelegateArtifact from "@artifacts/CErc20Delegate.json";
import CErc20DelegatorArtifact from "@artifacts/CErc20Delegator.json";
import CErc20PluginDelegateArtifact from "@artifacts/CErc20PluginDelegate.json";
import CErc20PluginRewardsDelegateArtifact from "@artifacts/CErc20PluginRewardsDelegate.json";
import ChainlinkPriceOracleV2Artifact from "@artifacts/ChainlinkPriceOracleV2.json";
import ComptrollerArtifact from "@artifacts/Comptroller.json";
import CTokenInterfaceArtifact from "@artifacts/CTokenInterface.json";
import CurveLpTokenPriceOracleNoRegistryArtifact from "@artifacts/CurveLpTokenPriceOracleNoRegistry.json";
import DAIInterestRateModelV2Artifact from "@artifacts/DAIInterestRateModelV2.json";
import DiaPriceOracleArtifact from "@artifacts/DiaPriceOracle.json";
import EIP20InterfaceArtifact from "@artifacts/EIP20Interface.json";
import ERC20Artifact from "@artifacts/ERC20.json";
import FixedNativePriceOracleArtifact from "@artifacts/FixedNativePriceOracle.json";
import FlywheelStaticRewardsArtifact from "@artifacts/FlywheelStaticRewards.json";
import FuseFlywheelDynamicRewardsArtifacts from "@artifacts/FuseFlywheelDynamicRewards.json";
import GelatoGUniPriceOracleArtifact from "@artifacts/GelatoGUniPriceOracle.json";
import JumpRateModelArtifact from "@artifacts/JumpRateModel.json";
import MasterPriceOracleArtifact from "@artifacts/MasterPriceOracle.json";
import MidasFlywheelArtifact from "@artifacts/MidasFlywheel.json";
import RewardsDistributorDelegateArtifact from "@artifacts/RewardsDistributorDelegate.json";
import RewardsDistributorDelegatorArtifact from "@artifacts/RewardsDistributorDelegator.json";
import SimplePriceOracleArtifact from "@artifacts/SimplePriceOracle.json";
import StkBNBPriceOracleArtifact from "@artifacts/StkBNBPriceOracle.json";
import UniswapLpTokenPriceOracleArtifact from "@artifacts/UniswapLpTokenPriceOracle.json";
import UniswapTwapPriceOracleV2Artifact from "@artifacts/UniswapTwapPriceOracleV2.json";
import UniswapTwapPriceOracleV2RootArtifact from "@artifacts/UniswapTwapPriceOracleV2Root.json";
import UnitrollerArtifact from "@artifacts/Unitroller.json";
import WhitePaperInterestRateModelArtifact from "@artifacts/WhitePaperInterestRateModel.json";

const CErc20Delegate: Artifact = CErc20DelegateArtifact;
const CErc20Delegator: Artifact = CErc20DelegatorArtifact;
const CErc20PluginDelegate: Artifact = CErc20PluginDelegateArtifact;
const CErc20PluginRewardsDelegate: Artifact = CErc20PluginRewardsDelegateArtifact;
const ChainlinkPriceOracleV2: Artifact = ChainlinkPriceOracleV2Artifact;
const Comptroller: Artifact = ComptrollerArtifact;
const CTokenInterface: Artifact = CTokenInterfaceArtifact;
const DiaPriceOracle: Artifact = DiaPriceOracleArtifact;
const DAIInterestRateModelV2: Artifact = DAIInterestRateModelV2Artifact;
const EIP20Interface: Artifact = EIP20InterfaceArtifact;
const ERC20: Artifact = ERC20Artifact;
const FuseFlywheelDynamicRewards: Artifact = FuseFlywheelDynamicRewardsArtifacts;
const FlywheelStaticRewards: Artifact = FlywheelStaticRewardsArtifact;
const MidasFlywheel: Artifact = MidasFlywheelArtifact;
const JumpRateModel: Artifact = JumpRateModelArtifact;
const AdjustableJumpRateModel: Artifact = AdjustableJumpRateModelArtifact;
const JumpRateModel_MIMO_002_004_4_08: Artifact = JumpRateModelArtifact;
const JumpRateModel_JARVIS_002_004_4_08: Artifact = JumpRateModelArtifact;
const AdjustableJumpRateModel_PSTAKE_WBNB: Artifact = AdjustableJumpRateModelArtifact;
const AdjustableJumpRateModel_MIXBYTES_XCDOT: Artifact = AdjustableJumpRateModelArtifact;
const AdjustableJumpRateModel_TRANSFERO_BRZ: Artifact = AdjustableJumpRateModelArtifact;
const AdjustableJumpRateModel_TRANSFERO_BTCB_ETH_MAI_WBNB: Artifact = AdjustableJumpRateModelArtifact;
const AdjustableJumpRateModel_STADER_WBNB: Artifact = AdjustableJumpRateModelArtifact;
const AdjustableJumpRateModel_MIXBYTES_USDC: Artifact = AdjustableJumpRateModelArtifact;
const AdjustableJumpRateModel_JARVIS_jBRL: Artifact = AdjustableJumpRateModelArtifact;
const AnkrBNBInterestRateModel: Artifact = AnkrBNBInterestRateModelArtifact;
const MasterPriceOracle: Artifact = MasterPriceOracleArtifact;
const FixedNativePriceOracle: Artifact = FixedNativePriceOracleArtifact;
const CurveLpTokenPriceOracleNoRegistry: Artifact = CurveLpTokenPriceOracleNoRegistryArtifact;
const UniswapLpTokenPriceOracle: Artifact = UniswapLpTokenPriceOracleArtifact;
const UniswapTwapPriceOracleV2Root: Artifact = UniswapTwapPriceOracleV2RootArtifact;
const RewardsDistributorDelegate: Artifact = RewardsDistributorDelegateArtifact;
const RewardsDistributorDelegator: Artifact = RewardsDistributorDelegatorArtifact;
const SimplePriceOracle: Artifact = SimplePriceOracleArtifact;
const BalancerLpTokenPriceOracle: Artifact = BalancerLpTokenPriceOracleArtifact;
const AnkrBNBcPriceOracle: Artifact = AnkrBNBcPriceOracleArtifact;
const StkBNBPriceOracle: Artifact = StkBNBPriceOracleArtifact;
const BNBxPriceOracle: Artifact = BNBxPriceOracleArtifact;
const GelatoGUniPriceOracle: Artifact = GelatoGUniPriceOracleArtifact;
const UniswapTwapPriceOracleV2: Artifact = UniswapTwapPriceOracleV2Artifact;
const Unitroller: Artifact = UnitrollerArtifact;
const WhitePaperInterestRateModel: Artifact = WhitePaperInterestRateModelArtifact;

const ARTIFACTS = {
  CErc20Delegate,
  CErc20Delegator,
  CErc20PluginDelegate,
  CErc20PluginRewardsDelegate,
  ChainlinkPriceOracleV2,
  Comptroller,
  CTokenInterface,
  DAIInterestRateModelV2,
  DiaPriceOracle,
  EIP20Interface,
  ERC20,
  FuseFlywheelDynamicRewards,
  FlywheelStaticRewards,
  MidasFlywheel,
  JumpRateModel,
  AdjustableJumpRateModel,
  AdjustableJumpRateModel_PSTAKE_WBNB,
  AdjustableJumpRateModel_MIXBYTES_XCDOT,
  AdjustableJumpRateModel_TRANSFERO_BRZ,
  AdjustableJumpRateModel_TRANSFERO_BTCB_ETH_MAI_WBNB,
  AdjustableJumpRateModel_STADER_WBNB,
  AdjustableJumpRateModel_MIXBYTES_USDC,
  AdjustableJumpRateModel_JARVIS_jBRL,
  JumpRateModel_MIMO_002_004_4_08,
  JumpRateModel_JARVIS_002_004_4_08,
  AnkrBNBInterestRateModel,
  MasterPriceOracle,
  FixedNativePriceOracle,
  CurveLpTokenPriceOracleNoRegistry,
  UniswapLpTokenPriceOracle,
  UniswapTwapPriceOracleV2Root,
  RewardsDistributorDelegate,
  RewardsDistributorDelegator,
  SimplePriceOracle,
  BalancerLpTokenPriceOracle,
  AnkrBNBcPriceOracle,
  StkBNBPriceOracle,
  BNBxPriceOracle,
  GelatoGUniPriceOracle,
  UniswapTwapPriceOracleV2,
  Unitroller,
  WhitePaperInterestRateModel,
};

export type Artifacts = typeof ARTIFACTS;

export {
  ARTIFACTS,
  CErc20Delegate,
  CErc20Delegator,
  CErc20PluginDelegate,
  CErc20PluginRewardsDelegate,
  ChainlinkPriceOracleV2,
  Comptroller,
  CTokenInterface,
  DiaPriceOracle,
  DAIInterestRateModelV2,
  EIP20Interface,
  ERC20,
  FuseFlywheelDynamicRewards,
  FlywheelStaticRewards,
  MidasFlywheel,
  JumpRateModel,
  AdjustableJumpRateModel,
  AdjustableJumpRateModel_PSTAKE_WBNB,
  AdjustableJumpRateModel_MIXBYTES_XCDOT,
  AdjustableJumpRateModel_TRANSFERO_BRZ,
  AdjustableJumpRateModel_TRANSFERO_BTCB_ETH_MAI_WBNB,
  AdjustableJumpRateModel_STADER_WBNB,
  AdjustableJumpRateModel_MIXBYTES_USDC,
  AdjustableJumpRateModel_JARVIS_jBRL,
  JumpRateModel_MIMO_002_004_4_08,
  JumpRateModel_JARVIS_002_004_4_08,
  AnkrBNBInterestRateModel,
  MasterPriceOracle,
  RewardsDistributorDelegate,
  RewardsDistributorDelegator,
  SimplePriceOracle,
  BalancerLpTokenPriceOracle,
  AnkrBNBcPriceOracle,
  StkBNBPriceOracle,
  BNBxPriceOracle,
  GelatoGUniPriceOracle,
  UniswapTwapPriceOracleV2,
  UniswapTwapPriceOracleV2Root,
  Unitroller,
  WhitePaperInterestRateModel,
};

export default ARTIFACTS;

export const oracleConfig = (deployments: ChainDeployment, artifacts: Artifacts, availableOracles: Array<string>) => {
  const asMap = new Map(availableOracles.map((o) => [o, { abi: artifacts[o].abi, address: deployments[o].address }]));
  return Object.fromEntries(asMap);
};

export const irmConfig = (deployments: ChainDeployment, artifacts: Artifacts, availableIrms: Array<string>) => {
  const asMap = new Map(availableIrms.map((o) => [o, { abi: artifacts[o].abi, address: deployments[o].address }]));
  return Object.fromEntries(asMap);
};
