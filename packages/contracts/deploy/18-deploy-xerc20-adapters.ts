import { DeployFunction } from "hardhat-deploy/types";
import { Address } from "viem";
import { base, bob, fraxtal, mode, optimism } from "viem/chains";

const lzEndpoints: Record<number, Address> = {
  [base.id]: "0x1a44076050125825900e736c501f859c50fE728c",
  [optimism.id]: "0x1a44076050125825900e736c501f859c50fE728c",
  [fraxtal.id]: "0x1a44076050125825900e736c501f859c50fE728c",
  [bob.id]: "0x1a44076050125825900e736c501f859c50fE728c",
  [mode.id]: "0x1a44076050125825900e736c501f859c50fE728c"
};

const ionTokens: Record<number, Address> = {
  [base.id]: "0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5",
  [optimism.id]: "0x887d1c6A4f3548279c2a8A9D0FA61B5D458d14fC",
  [mode.id]: "0x18470019bf0e94611f15852f7e93cf5d65bc34ca"
};

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

  const lzEndpoint = lzEndpoints[chainId];
  if (lzEndpoint) {
    const xerc20LayerZeroDeployment = await deployments.deploy("xERC20LayerZero", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
      args: [10, lzEndpoint]
    });
    console.log(
      "xERC20LayerZero deployed to: ",
      xerc20LayerZeroDeployment.address,
      xerc20LayerZeroDeployment.transactionHash
    );

    for (const [, token] of Object.entries(ionTokens).filter(([_chainId]) => Number(_chainId) !== Number(chainId))) {
      const xerc20LayerZero = await viem.getContractAt("xERC20LayerZero", xerc20LayerZeroDeployment.address as Address);
      const tx = await xerc20LayerZero.write.setMappedToken([chainId, ionTokens[chainId], token]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("tx: ", tx);
    }
  }
};

func.tags = ["prod", "xerc20-adapters"];

export default func;
