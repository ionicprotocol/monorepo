import { DeployFunction } from "hardhat-deploy/types";
import { Address } from "viem";
import { chainIdtoChain } from "@ionicprotocol/chains";

const func: DeployFunction = async ({ run, viem, getNamedAccounts, deployments, getChainId }) => {
  const { deployer } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());
  const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
  const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });

  const fpd = await viem.getContractAt("PoolDirectory", (await deployments.get("PoolDirectory")).address as Address, {
    client: { public: publicClient, wallet: walletClient }
  });

  const mflrReceipt = await deployments.deploy("IonicFlywheelLensRouter", {
    from: deployer,
    args: [fpd.address],
    log: true,
    waitConfirmations: 1
  });
  if (mflrReceipt.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: mflrReceipt.transactionHash as Address });
  console.log("IonicFlywheelLensRouter: ", mflrReceipt.address);

  const booster = await deployments.deploy("LooplessFlywheelBooster", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1
  });
  if (booster.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: booster.transactionHash as Address });
  console.log("LooplessFlywheelBooster: ", booster.address);
  if (booster.newlyDeployed) await run("flywheels:booster:update");
};

func.tags = ["prod", "deploy-flywheel"];

export default func;
