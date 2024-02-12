import { task } from "hardhat/config";

import { IonicLiquidator } from "../../typechain/IonicLiquidator";
import { LiquidatorsRegistry } from "../../typechain/LiquidatorsRegistry";
import { LiquidatorsRegistryExtension } from "../../typechain/LiquidatorsRegistryExtension";
import { ChainDeployConfig, chainDeployConfig } from "../../chainDeploy";
import { configureIonicLiquidator } from "../../chainDeploy/helpers/liquidators/ionicLiquidator";
import { configureLiquidatorsRegistry } from "../../chainDeploy/helpers/liquidators/registry";

task("deploy:kim:liquidator").setAction(async ({}, { ethers, getChainId, deployments, getNamedAccounts }) => {
  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);
  const { deployer } = await getNamedAccounts();
  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  //// kim exchange uni-v2-like redemptions
  const kimUniV2Liquidator = await deployments.deploy("KimUniV2Liquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (kimUniV2Liquidator.transactionHash) {
    await ethers.provider.waitForTransaction(kimUniV2Liquidator.transactionHash);
  }
  console.log("KimUniV2Liquidator: ", kimUniV2Liquidator.address);

  const ionicLiquidatorDep = await deployments.deploy("IonicLiquidator", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1
  });
  if (ionicLiquidatorDep.transactionHash) await ethers.provider.waitForTransaction(ionicLiquidatorDep.transactionHash);
  console.log("IonicLiquidator: ", ionicLiquidatorDep.address);

  const ionicLiquidator = (await ethers.getContract("IonicLiquidator", deployer)) as IonicLiquidator;

  const currentWToken = await ionicLiquidator.callStatic.W_NATIVE_ADDRESS();
  if (currentWToken === ethers.constants.AddressZero) {
    const tx = await ionicLiquidator.initialize(
      chainDeployParams.wtoken,
      chainDeployParams.uniswap.uniswapV2RouterAddress,
      chainDeployParams.uniswap.flashSwapFee
    );
    await tx.wait();
    console.log(`initialized the non-upgradeable Ionic Liquidator ${tx.hash}`);
  } else {
    console.log(`Ionic Liquidator already initialized`);
  }

  await configureIonicLiquidator({
    contractName: "IonicLiquidator",
    chainId,
    ethers,
    getNamedAccounts
  });

  const liquidatorsRegistryExtension = (await ethers.getContract(
    "LiquidatorsRegistryExtension",
    deployer
  )) as LiquidatorsRegistryExtension;
  const liquidatorsRegistry = (await ethers.getContract("LiquidatorsRegistry", deployer)) as LiquidatorsRegistry;

  const liquidatorsRegistryExtensionDep = await deployments.deploy("LiquidatorsRegistryExtension", {
    from: deployer,
    log: true,
    args: []
  });
  if (liquidatorsRegistryExtensionDep.transactionHash)
    await ethers.provider.waitForTransaction(liquidatorsRegistryExtensionDep.transactionHash);
  console.log("LiquidatorsRegistryExtension: ", liquidatorsRegistryExtensionDep.address);

  const tx = await liquidatorsRegistry._registerExtension(
    liquidatorsRegistryExtensionDep.address,
    liquidatorsRegistryExtension.address
  );
  await tx.wait();
  console.log(
    `replaced the liquidators registry first extension ${liquidatorsRegistryExtension.address} with the new ${liquidatorsRegistryExtensionDep.address}`
  );

  await configureLiquidatorsRegistry({
    ethers,
    getNamedAccounts,
    chainId
  });

  console.log(`Done`);
});
