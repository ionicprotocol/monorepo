import { DeployFunction } from "hardhat-deploy/types";
import { Address, fromBytes, toBytes } from "viem";
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

const adapters: Record<number, { address: Address; eid: number }> = {
  [base.id]: { address: "0x4e055E4A1d66DeA2525f3eD4281388659649832D", eid: 30184 },
  [mode.id]: { address: "0x00425568A3EafeC62eA711fC5e8F7C3732dF7Cf3", eid: 30260 }
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

    for (const [otherChainId, token] of Object.entries(ionTokens)) {
      const xerc20LayerZero = await viem.getContractAt("xERC20LayerZero", xerc20LayerZeroDeployment.address as Address);
      // this chain to destination
      const mappedTokenToDestination = await xerc20LayerZero.read.mappedTokens([
        ionTokens[chainId],
        Number(otherChainId)
      ]);
      console.log(
        `xERC20LayerZero mappedToken for ${ionTokens[chainId]} on chain ${otherChainId} is ${mappedTokenToDestination}, expected ${token}`
      );
      if (mappedTokenToDestination.toLowerCase() !== token.toLowerCase()) {
        const tx = await xerc20LayerZero.write.setMappedToken([Number(otherChainId), ionTokens[chainId], token]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(
          `xERC20LayerZero setMappedToken for ${ionTokens[chainId]} to ${token} on chain ${otherChainId} - tx: ${tx}`
        );
      }

      // destination to this chain
      const mappedTokenToSource = await xerc20LayerZero.read.mappedTokens([token, chainId]);
      console.log(
        `xERC20LayerZero mappedToken for ${token} on chain ${chainId} is ${mappedTokenToSource}, expected ${ionTokens[chainId]}`
      );
      if (mappedTokenToSource.toLowerCase() !== ionTokens[chainId].toLowerCase()) {
        const tx = await xerc20LayerZero.write.setMappedToken([chainId, token, ionTokens[chainId]]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
      }
    }

    for (const [otherChainId, adapter] of Object.entries(adapters).filter(([_chainId]) => +_chainId !== chainId)) {
      const addressInBytes = fromBytes(toBytes(adapter.address, { size: 32 }), "hex");
      console.log("🚀 ~ constfunc:DeployFunction= ~ addressInBytes:", addressInBytes);
      const xerc20LayerZero = await viem.getContractAt("xERC20LayerZero", adapter.address as Address);
      const peers = await xerc20LayerZero.read.peers([adapter.eid]);
      const tx = await xerc20LayerZero.write.setPeer([adapter.eid, lzEndpoints[chainId]]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
    }
  }
};

func.tags = ["prod", "xerc20-adapters"];

export default func;
