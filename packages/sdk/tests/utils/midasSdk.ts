import { bsc, ganache, moonbeam, neondevnet, polygon } from "@midas-capital/chains";
import { ChainConfig, ChainDeployment, SupportedChains } from "@midas-capital/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployments, ethers } from "hardhat";

import { WETH } from "../../lib/contracts/typechain/WETH";
import { MidasSdk } from "../../src";

let midasSdk: MidasSdk;

export const getCommonDeployments = async (chainDeployment: ChainDeployment) => {
  const CErc20Delegate = await ethers.getContract("CErc20Delegate");
  const CErc20DelegateArtifact = await deployments.getArtifact("CErc20Delegate");
  chainDeployment.CErc20Delegate = { abi: CErc20DelegateArtifact.abi, address: CErc20Delegate.address };

  const CErc20PluginDelegate = await ethers.getContract("CErc20PluginDelegate");
  const CErc20PluginDelegateArtifact = await deployments.getArtifact("CErc20PluginDelegate");
  chainDeployment.CErc20PluginDelegate = {
    abi: CErc20PluginDelegateArtifact.abi,
    address: CErc20PluginDelegate.address,
  };

  const CErc20PluginRewardsDelegate = await ethers.getContract("CErc20PluginRewardsDelegate");
  const CErc20PluginRewardsArtifact = await deployments.getArtifact("CErc20PluginRewardsDelegate");
  chainDeployment.CErc20PluginRewardsDelegate = {
    abi: CErc20PluginRewardsArtifact.abi,
    address: CErc20PluginRewardsDelegate.address,
  };

  const CEtherDelegate = await ethers.getContract("CEtherDelegate");
  const CEtherDelegateArtifact = await deployments.getArtifact("CEtherDelegate");
  chainDeployment.CEtherDelegate = { abi: CEtherDelegateArtifact.abi, address: CEtherDelegate.address };
  const Comptroller = await ethers.getContract("Comptroller");
  const ComptrollerArtifact = await deployments.getArtifact("Comptroller.sol:Comptroller");
  chainDeployment.Comptroller = { abi: ComptrollerArtifact.abi, address: Comptroller.address };
  const FixedNativePriceOracle = await ethers.getContract("FixedNativePriceOracle");
  const FixedNativePriceOracleArtifact = await deployments.getArtifact("FixedNativePriceOracle");
  chainDeployment.FixedNativePriceOracle = {
    abi: FixedNativePriceOracleArtifact.abi,
    address: FixedNativePriceOracle.address,
  };
  const FuseFeeDistributor = await ethers.getContract("FuseFeeDistributor");
  const FuseFeeDistributorArtifact = await deployments.getArtifact("FuseFeeDistributor");
  chainDeployment.FuseFeeDistributor = { abi: FuseFeeDistributorArtifact.abi, address: FuseFeeDistributor.address };
  const FusePoolDirectory = await ethers.getContract("FusePoolDirectory");
  const FusePoolDirectoryArtifact = await deployments.getArtifact("FusePoolDirectory");
  chainDeployment.FusePoolDirectory = { abi: FusePoolDirectoryArtifact.abi, address: FusePoolDirectory.address };
  const FusePoolLens = await ethers.getContract("FusePoolLens");
  const FusePoolLensArtifact = await deployments.getArtifact("FusePoolLens");
  chainDeployment.FusePoolLens = { abi: FusePoolLensArtifact.abi, address: FusePoolLens.address };
  const FusePoolLensSecondary = await ethers.getContract("FusePoolLensSecondary");
  const FusePoolLensSecondaryArtifact = await deployments.getArtifact("FusePoolLensSecondary");
  chainDeployment.FusePoolLensSecondary = {
    abi: FusePoolLensSecondaryArtifact.abi,
    address: FusePoolLensSecondary.address,
  };
  const FuseFlywheelLensRouter = await ethers.getContract("FuseFlywheelLensRouter");
  const FuseFlywheelLensRouterArtifact = await deployments.getArtifact("FuseFlywheelLensRouter");
  chainDeployment.FuseFlywheelLensRouter = {
    abi: FuseFlywheelLensRouterArtifact.abi,
    address: FuseFlywheelLensRouter.address,
  };
  const FuseSafeLiquidator = await ethers.getContract("FuseSafeLiquidator");
  const FuseSafeLiquidatorArtifact = await deployments.getArtifact("FuseSafeLiquidator");
  chainDeployment.FuseSafeLiquidator = { abi: FuseSafeLiquidatorArtifact.abi, address: FuseSafeLiquidator.address };
  const InitializableClones = await ethers.getContract("InitializableClones");
  const InitializableClonesArtifact = await deployments.getArtifact("InitializableClones");
  chainDeployment.InitializableClones = { abi: InitializableClonesArtifact.abi, address: InitializableClones.address };
  const JumpRateModel = await ethers.getContract("JumpRateModel");
  const JumpRateModelArtifact = await deployments.getArtifact("JumpRateModel");
  chainDeployment.JumpRateModel = { abi: JumpRateModelArtifact.abi, address: JumpRateModel.address };
  const MasterPriceOracle = await ethers.getContract("MasterPriceOracle");
  const MasterPriceOracleArtifact = await deployments.getArtifact("MasterPriceOracle");
  chainDeployment.MasterPriceOracle = { abi: MasterPriceOracleArtifact.abi, address: MasterPriceOracle.address };
  const RewardsDistributorDelegate = await ethers.getContract("RewardsDistributorDelegate");
  const RewardsDistributorDelegateArtifact = await deployments.getArtifact("RewardsDistributorDelegate");
  chainDeployment.RewardsDistributorDelegate = {
    abi: RewardsDistributorDelegateArtifact.abi,
    address: RewardsDistributorDelegate.address,
  };
  const SimplePriceOracle = await ethers.getContract("SimplePriceOracle");
  const SimplePriceOracleArtifact = await deployments.getArtifact("SimplePriceOracle");
  chainDeployment.SimplePriceOracle = { abi: SimplePriceOracleArtifact.abi, address: SimplePriceOracle.address };

  const WhitePaperInterestRateModel = await ethers.getContract("WhitePaperInterestRateModel");
  const WhitePaperInterestRateModelArtifact = await deployments.getArtifact("WhitePaperInterestRateModel");
  chainDeployment.WhitePaperInterestRateModel = {
    abi: WhitePaperInterestRateModelArtifact.abi,
    address: WhitePaperInterestRateModel.address,
  };

  return chainDeployment;
};

export const getLocalDeployments = async (): Promise<ChainDeployment> => {
  const chainDeployment: ChainDeployment = {};

  const TOUCHToken = await ethers.getContract("TOUCHToken");
  const TOUCHTokenArtifact = await deployments.getArtifact("TOUCHToken");
  chainDeployment.TOUCHToken = { abi: TOUCHTokenArtifact.abi, address: TOUCHToken.address };
  const TRIBEToken = await ethers.getContract("TRIBEToken");
  const TRIBETokenArtifact = await deployments.getArtifact("TRIBEToken");
  chainDeployment.TRIBEToken = { abi: TRIBETokenArtifact.abi, address: TRIBEToken.address };
  return await getCommonDeployments(chainDeployment);
};

export const getBscForkDeployments = async (): Promise<ChainDeployment> => {
  const chainDeployment: ChainDeployment = {};
  const AnkrBNBInterestRateModel = await ethers.getContract("AnkrBNBInterestRateModel");
  const AnkrBNBInterestRateModelArtifact = await deployments.getArtifact("AnkrBNBInterestRateModel");
  chainDeployment.AnkrBNBInterestRateModel = {
    abi: AnkrBNBInterestRateModelArtifact.abi,
    address: AnkrBNBInterestRateModel.address,
  };
  const WhitePaperInterestRateModel = await ethers.getContract("WhitePaperInterestRateModel");
  const WhitePaperInterestRateModelArtifact = await deployments.getArtifact("WhitePaperInterestRateModel");
  chainDeployment.WhitePaperInterestRateModel = {
    abi: WhitePaperInterestRateModelArtifact.abi,
    address: WhitePaperInterestRateModel.address,
  };
  const ChainlinkPriceOracleV2 = await ethers.getContract("ChainlinkPriceOracleV2");
  const ChainlinkPriceOracleV2Artifact = await deployments.getArtifact("ChainlinkPriceOracleV2");
  chainDeployment.ChainlinkPriceOracleV2 = {
    abi: ChainlinkPriceOracleV2Artifact.abi,
    address: ChainlinkPriceOracleV2.address,
  };

  const UniswapTwapPriceOracleV2Root = await ethers.getContract("UniswapTwapPriceOracleV2Root");
  const UniswapTwapPriceOracleV2RootArtifact = await deployments.getArtifact("UniswapTwapPriceOracleV2Root");
  chainDeployment.UniswapTwapPriceOracleV2Root = {
    abi: UniswapTwapPriceOracleV2RootArtifact.abi,
    address: UniswapTwapPriceOracleV2Root.address,
  };

  const UniswapTwapPriceOracleV2 = await ethers.getContract("UniswapTwapPriceOracleV2");
  const UniswapTwapPriceOracleV2Artifact = await deployments.getArtifact("UniswapTwapPriceOracleV2");
  chainDeployment.UniswapTwapPriceOracleV2 = {
    abi: UniswapTwapPriceOracleV2Artifact.abi,
    address: UniswapTwapPriceOracleV2.address,
  };
  const CurveLpTokenPriceOracleNoRegistry = await ethers.getContract("CurveLpTokenPriceOracleNoRegistry");
  const CurveLpTokenPriceOracleNoRegistryArtifact = await deployments.getArtifact("CurveLpTokenPriceOracleNoRegistry");
  chainDeployment.CurveLpTokenPriceOracleNoRegistry = {
    abi: CurveLpTokenPriceOracleNoRegistryArtifact.abi,
    address: CurveLpTokenPriceOracleNoRegistry.address,
  };
  const XBombLiquidatorFunder = await ethers.getContract("XBombLiquidatorFunder");
  const XBombLiquidatorFunderArtifact = await deployments.getArtifact("XBombLiquidatorFunder");
  chainDeployment.XBombLiquidatorFunder = {
    abi: XBombLiquidatorFunderArtifact.abi,
    address: XBombLiquidatorFunder.address,
  };
  const JarvisLiquidatorFunder = await ethers.getContract("JarvisLiquidatorFunder");
  const JarvisLiquidatorFunderArtifact = await deployments.getArtifact("JarvisLiquidatorFunder");
  chainDeployment.JarvisLiquidatorFunder = {
    abi: JarvisLiquidatorFunderArtifact.abi,
    address: JarvisLiquidatorFunder.address,
  };
  const CurveLpTokenLiquidatorNoRegistry = await ethers.getContract("CurveLpTokenLiquidatorNoRegistry");
  const CurveLpTokenLiquidatorNoRegistryArtifact = await deployments.getArtifact("CurveLpTokenLiquidatorNoRegistry");
  chainDeployment.CurveLpTokenLiquidatorNoRegistry = {
    abi: CurveLpTokenLiquidatorNoRegistryArtifact.abi,
    address: CurveLpTokenLiquidatorNoRegistry.address,
  };
  const CurveSwapLiquidator = await ethers.getContract("CurveSwapLiquidator");
  const CurveSwapLiquidatorArtifact = await deployments.getArtifact("CurveSwapLiquidator");
  chainDeployment.CurveSwapLiquidator = {
    abi: CurveSwapLiquidatorArtifact.abi,
    address: CurveSwapLiquidator.address,
  };
  return await getCommonDeployments(chainDeployment);
};

export const getOrCreateMidas = async (namedSigner?: string): Promise<MidasSdk> => {
  if (!midasSdk) {
    let signer;
    if (namedSigner) {
      signer = await ethers.getNamedSigner("deployer");
    } else {
      signer = await ethers.getSigners()[0];
    }
    // INFO: In test this can still be undefined, not sure why
    // falls back to ethers.provider, we used this as default before this
    if (!signer) {
      signer = ethers.provider;
    }
    const { chainId } = await ethers.provider.getNetwork();
    let chainDeployment: ChainDeployment;
    let chainConfig: ChainConfig;

    // for integration tests, always use live BSC deployments and config
    if (process.env.INTEGRATION_TEST!) {
      return new MidasSdk(signer, bsc);
    }

    switch (chainId) {
      case SupportedChains.ganache:
        chainDeployment = await getLocalDeployments();
        chainConfig = ganache;
        chainConfig.chainDeployments = chainDeployment;
        break;
      case SupportedChains.bsc:
        chainConfig = bsc;
        if (process.env.FORK_CHAIN_ID!) {
          chainDeployment = await getBscForkDeployments();
          chainConfig.chainDeployments = chainDeployment;
        }
        break;
      case SupportedChains.moonbeam:
        chainConfig = moonbeam;
        break;
      case SupportedChains.neon_devnet:
        chainConfig = neondevnet;
        break;
      case SupportedChains.polygon:
        chainConfig = polygon;
        break;
    }

    midasSdk = new MidasSdk(signer, chainConfig);

    // patch WETH for local deployment
    if (chainId === 31337 || chainId === 1337) {
      const weth = (await ethers.getContract("WETH")) as WETH;
      midasSdk.chainSpecificAddresses.W_TOKEN = weth.address;
    }
  }

  return midasSdk;
};
