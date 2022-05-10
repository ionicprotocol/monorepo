import func from "./deploy";
import { DeployFunction } from "hardhat-deploy/types";

// use with mainnet forking to simulate the prod deployment
const simulateDeploy: DeployFunction = async (hre): Promise<void> => {
  const { deployer, alice } = await hre.getNamedAccounts();
  const signer = hre.ethers.provider.getSigner(alice);
  signer.sendTransaction({ to: deployer, value: hre.ethers.utils.parseEther("10") });
  await func(hre);
};
simulateDeploy.tags = ["simulate", "fork", "local"];

export default simulateDeploy;
