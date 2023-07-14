import { JsonRpcProvider } from "@ethersproject/providers";
import { arbitrum, bsc, chapel, ethereum, ganache, neondevnet, polygon } from "@ionicprotocol/chains";
import { ChainConfig, ChainDeployment, SupportedChains } from "@ionicprotocol/types";
import { Signer } from "ethers";
import { deployments, ethers } from "hardhat";

import { IonicSdk } from "../src";
import { WETH } from "../typechain/WETH";

let ionicSdk: IonicSdk;

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
  const Comptroller = await ethers.getContract("Comptroller");
  const ComptrollerArtifact = await deployments.getArtifact("Comptroller.sol:Comptroller");
  chainDeployment.Comptroller = { abi: ComptrollerArtifact.abi, address: Comptroller.address };
  const ComptrollerFirstExtension = await ethers.getContract("ComptrollerFirstExtension");
  const ComptrollerFirstExtensionArtifact = await deployments.getArtifact("ComptrollerFirstExtension");
  chainDeployment.ComptrollerFirstExtension = {
    abi: ComptrollerFirstExtensionArtifact.abi,
    address: ComptrollerFirstExtension.address,
  };
  const FixedNativePriceOracle = await ethers.getContract("FixedNativePriceOracle");
  const FixedNativePriceOracleArtifact = await deployments.getArtifact("FixedNativePriceOracle");
  chainDeployment.FixedNativePriceOracle = {
    abi: FixedNativePriceOracleArtifact.abi,
    address: FixedNativePriceOracle.address,
  };
  const FeeDistributor = await ethers.getContract("FeeDistributor");
  const FeeDistributorArtifact = await deployments.getArtifact("FeeDistributor");
  chainDeployment.FeeDistributor = { abi: FeeDistributorArtifact.abi, address: FeeDistributor.address };
  const PoolDirectory = await ethers.getContract("PoolDirectory");
  const PoolDirectoryArtifact = await deployments.getArtifact("PoolDirectory");
  chainDeployment.PoolDirectory = { abi: PoolDirectoryArtifact.abi, address: PoolDirectory.address };
  const PoolLens = await ethers.getContract("PoolLens");
  const PoolLensArtifact = await deployments.getArtifact("PoolLens");
  chainDeployment.PoolLens = { abi: PoolLensArtifact.abi, address: PoolLens.address };
  const PoolLensSecondary = await ethers.getContract("PoolLensSecondary");
  const PoolLensSecondaryArtifact = await deployments.getArtifact("PoolLensSecondary");
  chainDeployment.PoolLensSecondary = {
    abi: PoolLensSecondaryArtifact.abi,
    address: PoolLensSecondary.address,
  };
  const IonicFlywheelLensRouter = await ethers.getContract("IonicFlywheelLensRouter");
  const IonicFlywheelLensRouterArtifact = await deployments.getArtifact("IonicFlywheelLensRouter");
  chainDeployment.IonicFlywheelLensRouter = {
    abi: IonicFlywheelLensRouterArtifact.abi,
    address: IonicFlywheelLensRouter.address,
  };
  const IonicLiquidator = await ethers.getContract("IonicLiquidator");
  const IonicLiquidatorArtifact = await deployments.getArtifact("IonicLiquidator");
  chainDeployment.IonicLiquidator = { abi: IonicLiquidatorArtifact.abi, address: IonicLiquidator.address };
  const JumpRateModel = await ethers.getContract("JumpRateModel");
  const JumpRateModelArtifact = await deployments.getArtifact("JumpRateModel");
  chainDeployment.JumpRateModel = { abi: JumpRateModelArtifact.abi, address: JumpRateModel.address };
  const MasterPriceOracle = await ethers.getContract("MasterPriceOracle");
  const MasterPriceOracleArtifact = await deployments.getArtifact("MasterPriceOracle");
  chainDeployment.MasterPriceOracle = { abi: MasterPriceOracleArtifact.abi, address: MasterPriceOracle.address };
  const SimplePriceOracle = await ethers.getContract("SimplePriceOracle");
  const SimplePriceOracleArtifact = await deployments.getArtifact("SimplePriceOracle");
  chainDeployment.SimplePriceOracle = { abi: SimplePriceOracleArtifact.abi, address: SimplePriceOracle.address };

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

export const getOrCreateIonic = async (signerOrProviderOrSignerName?: unknown | string): Promise<IonicSdk> => {
  if (!ionicSdk) {
    let signer;
    if (!signerOrProviderOrSignerName) {
      signer = ethers.provider;
    } else {
      if (typeof signerOrProviderOrSignerName === "string") {
        signer = await ethers.getNamedSigner(signerOrProviderOrSignerName);
      }
      if (JsonRpcProvider.isProvider(signerOrProviderOrSignerName) || Signer.isSigner(signerOrProviderOrSignerName)) {
        signer = signerOrProviderOrSignerName;
      } else {
        signer = await ethers.getSigners()[0];
      }
    }

    const { chainId } = await ethers.provider.getNetwork();
    let chainDeployment: ChainDeployment;
    let chainConfig: ChainConfig;

    // for integration tests, always use live BSC deployments and config
    if (process.env.INTEGRATION_TEST!) {
      return new IonicSdk(signer, bsc);
    }

    switch (chainId) {
      case SupportedChains.ganache:
        chainDeployment = await getLocalDeployments();
        chainConfig = ganache;
        chainConfig.chainDeployments = chainDeployment;
        break;
      case SupportedChains.bsc:
        chainConfig = bsc;
        break;
      case SupportedChains.chapel:
        chainConfig = chapel;
        break;
      case SupportedChains.neon_devnet:
        chainConfig = neondevnet;
        break;
      case SupportedChains.polygon:
        chainConfig = polygon;
        break;
      case SupportedChains.arbitrum:
        chainConfig = arbitrum;
        break;
      case SupportedChains.ethereum:
        chainConfig = ethereum;
        break;
    }

    // Override for when in SIMULATION
    if (process.env.SIMULATION!) {
      chainDeployment = await getBscForkDeployments();
      chainConfig.chainDeployments = chainDeployment;
    }

    ionicSdk = new IonicSdk(signer, chainConfig);

    // patch WETH for local deployment
    if (chainId === 31337 || chainId === 1337) {
      const weth = (await ethers.getContract("WETH")) as WETH;
      ionicSdk.chainSpecificAddresses.W_TOKEN = weth.address;
    }
  }

  return ionicSdk;
};
