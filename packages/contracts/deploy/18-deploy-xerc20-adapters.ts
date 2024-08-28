import { DeployFunction } from "hardhat-deploy/types";
import { Address, fromBytes, pad, toBytes } from "viem";
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
  [base.id]: { address: "0xCCe0fE8EEfd041b17E29cb73f959F1d4CD602451", eid: 30184 },
  [mode.id]: { address: "0xa6233522a3f9A2c356ba8b339604815E9e1efdD9", eid: 30260 }
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

    const thisChainToken = ionTokens[chainId];
    for (const [otherChainId, otherChainToken] of Object.entries(ionTokens).filter(
      ([otherChainId]) => +otherChainId !== chainId
    )) {
      const xerc20LayerZero = await viem.getContractAt("xERC20LayerZero", xerc20LayerZeroDeployment.address as Address);
      // this chain to destination
      const mappedTokenToDestination = await xerc20LayerZero.read.mappedTokens([thisChainToken, +otherChainId]);
      console.log(
        `xERC20LayerZero mappedToken for ${thisChainToken} to chain ${otherChainId} is ${mappedTokenToDestination}, expected ${otherChainToken}`
      );
      if (mappedTokenToDestination.toLowerCase() !== otherChainToken.toLowerCase()) {
        const tx = await xerc20LayerZero.write.setMappedToken([Number(otherChainId), thisChainToken, otherChainToken]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(
          `xERC20LayerZero setMappedToken for ${thisChainToken} to ${otherChainToken} on chain ${otherChainId} - tx: ${tx}`
        );
      }

      // destination to this chain
      const mappedTokenToSource = await xerc20LayerZero.read.mappedTokens([otherChainToken, +otherChainId]);
      console.log(
        `xERC20LayerZero mappedToken for ${otherChainToken} from chain ${otherChainId} is ${mappedTokenToSource}, expected ${thisChainToken}`
      );
      if (mappedTokenToSource.toLowerCase() !== thisChainToken.toLowerCase()) {
        const tx = await xerc20LayerZero.write.setMappedToken([+otherChainId, otherChainToken, thisChainToken]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(
          `xERC20LayerZero setMappedToken for ${otherChainToken} to ${thisChainToken} on chain ${otherChainId} - tx: ${tx}`
        );
      }
    }

    // for (const [, adapter] of Object.entries(adapters).filter(([otherChainId]) => +otherChainId !== chainId)) {
    //   const addressInBytes = pad(adapter.address);
    //   const xerc20LayerZero = await viem.getContractAt("xERC20LayerZero", xerc20LayerZeroDeployment.address as Address);
    //   const peers = await xerc20LayerZero.read.peers([adapter.eid]);
    //   console.log(`Peer set to ${peers}, expected ${addressInBytes}`);
    //   if (peers.toLowerCase() !== addressInBytes.toLowerCase()) {
    //     const tx = await xerc20LayerZero.write.setPeer([adapter.eid, addressInBytes]);
    //     await publicClient.waitForTransactionReceipt({ hash: tx });
    //     console.log(`xERC20LayerZero setPeer for ${adapter.eid} to ${addressInBytes} on chain ${chainId} - tx: ${tx}`);
    //   }
    // }
  }
};

func.tags = ["prod", "xerc20-adapters"];

export default func;
