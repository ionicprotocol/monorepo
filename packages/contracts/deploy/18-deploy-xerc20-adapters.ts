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

const hyperlaneEndpoints: Record<number, Address> = {
  [base.id]: "0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D",
  [bob.id]: "0x8358D8291e3bEDb04804975eEa0fe9fe0fAfB147",
  [fraxtal.id]: "0x2f9DB5616fa3fAd1aB06cB2C906830BA63d135e3",
  [mode.id]: "0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7",
  [optimism.id]: "0xd4C1905BB1D26BC93DAC913e13CaCC278CdCC80D"
};

const hyperlaneDeployments: Record<number, Address> = {
  [optimism.id]: "0x80748Ff4c4505742e63ddf4Ab31114ce00Ee0B9e",
  [base.id]: "0x04d3Fcc666616A76822f303aA4546321458B8F10"
};

const ionTokens: Record<number, Address> = {
  [base.id]: "0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5",
  [optimism.id]: "0x887d1c6A4f3548279c2a8A9D0FA61B5D458d14fC",
  [mode.id]: "0x18470019bf0e94611f15852f7e93cf5d65bc34ca",
  [fraxtal.id]: "0x5BD5c0cB9E4404C63526433BcBd6d133C1d73ffE",
  [bob.id]: "0xb90f229f27851e205d77fd46487989ad6e44c17c"
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
      args: [10, lzEndpoint],
      skipIfAlreadyDeployed: true
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
  }

  const hyperlaneEndpoint = hyperlaneEndpoints[chainId];
  if (hyperlaneEndpoint) {
    const xerc20HyperlaneDeployment = await deployments.deploy("xERC20Hyperlane", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
      args: [10, hyperlaneEndpoint]
    });

    const thisChainToken = ionTokens[chainId];
    const xerc20Hyperlane = await viem.getContractAt("xERC20Hyperlane", xerc20HyperlaneDeployment.address as Address);
    for (const [otherChainId, otherChainToken] of Object.entries(ionTokens).filter(
      ([otherChainId]) => +otherChainId !== chainId
    )) {
      // this chain to destination
      const mappedTokenToDestination = await xerc20Hyperlane.read.mappedTokens([thisChainToken, +otherChainId]);
      console.log(
        `xerc20Hyperlane mappedToken for ${thisChainToken} to chain ${otherChainId} is ${mappedTokenToDestination}, expected ${otherChainToken}`
      );
      if (mappedTokenToDestination.toLowerCase() !== otherChainToken.toLowerCase()) {
        const tx = await xerc20Hyperlane.write.setMappedToken([Number(otherChainId), thisChainToken, otherChainToken]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(
          `xerc20Hyperlane setMappedToken for ${thisChainToken} to ${otherChainToken} on chain ${otherChainId} - tx: ${tx}`
        );
      }

      // destination to this chain
      const mappedTokenToSource = await xerc20Hyperlane.read.mappedTokens([otherChainToken, +otherChainId]);
      console.log(
        `xerc20Hyperlane mappedToken for ${otherChainToken} from chain ${otherChainId} is ${mappedTokenToSource}, expected ${thisChainToken}`
      );
      if (mappedTokenToSource.toLowerCase() !== thisChainToken.toLowerCase()) {
        const tx = await xerc20Hyperlane.write.setMappedToken([+otherChainId, otherChainToken, thisChainToken]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(
          `xerc20Hyperlane setMappedToken for ${otherChainToken} to ${thisChainToken} on chain ${otherChainId} - tx: ${tx}`
        );
      }
    }

    for (const [otherChainId, otherChainDeployment] of Object.entries(hyperlaneDeployments).filter(
      ([otherChainId]) => +otherChainId !== chainId
    )) {
      const registeredBridge = await xerc20Hyperlane.read.mappedBridges([+otherChainId]);
      console.log(
        `xerc20Hyperlane registeredBridge for chain ${otherChainId} is ${registeredBridge}, expected ${otherChainDeployment}`
      );
      if (otherChainDeployment && registeredBridge.toLowerCase() !== otherChainDeployment.toLowerCase()) {
        const tx = await xerc20Hyperlane.write.setMappedBridge([+otherChainId, otherChainDeployment]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`xerc20Hyperlane setMappedBridge for ${otherChainDeployment} on chain ${otherChainId} - tx: ${tx}`);
      }
    }
  }
};

func.tags = ["prod", "xerc20-adapters"];

export default func;
