import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

// Helper function to manually load the contract factory
async function getContractFactoryByName(hre: HardhatRuntimeEnvironment, contractName: string) {
  const artifactPath = path.resolve(
    hre.config.paths.root,
    `lib/contracts/out/${contractName}.sol/${contractName}.json`
  );
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact for ${contractName} not found at ${artifactPath}`);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  return new ethers.ContractFactory(artifact.abi, artifact.bytecode);
}

const upgradeMasterPriceOracle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, upgrades } = hre;
  const { log } = deployments;

  log("Starting upgrade of the MasterPriceOracle");

  const existingProxyAddress = "0x2BAF3A2B667A5027a83101d218A9e8B73577F117";
  const ContractFactory = await getContractFactoryByName(hre, "MasterPriceOracle");

  log("Preparing to upgrade the MasterPriceOracle...");
  const upgradedContract = await upgrades.upgradeProxy(existingProxyAddress, ContractFactory);

  log(`MasterPriceOracle has been upgraded at address: ${upgradedContract.address}`);
};

export default upgradeMasterPriceOracle;
upgradeMasterPriceOracle.tags = ["upgrade", "MasterPriceOracle"];
