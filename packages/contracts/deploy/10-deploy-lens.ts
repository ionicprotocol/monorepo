import { DeployFunction } from "hardhat-deploy/types";
import { Address, Hash, zeroAddress } from "viem";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { chainIdtoChain } from "@ionicprotocol/chains";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());
  const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
  const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });
  console.log("chainId: ", chainId);

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }

  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  const fplDeployment = await deployments.deploy("PoolLens", {
    from: deployer,
    log: true,
    waitConfirmations: 1
  });

  let tx: Hash;

  if (fplDeployment.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: fplDeployment.transactionHash as Hash });
  console.log("PoolLens: ", fplDeployment.address);
  const fusePoolLens = await viem.getContractAt("PoolLens", (await deployments.get("PoolLens")).address as Address, {
    client: { public: publicClient, wallet: walletClient }
  });
  let directory = await fusePoolLens.read.directory();
  if (directory === zeroAddress) {
    const fusePoolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address,
      { client: { public: publicClient, wallet: walletClient } }
    );
    tx = await fusePoolLens.write.initialize([
      fusePoolDirectory.address,
      chainDeployParams.nativeTokenName,
      chainDeployParams.nativeTokenSymbol,
      chainDeployParams.uniswap.hardcoded.map((h) => h.address),
      chainDeployParams.uniswap.hardcoded.map((h) => h.name),
      chainDeployParams.uniswap.hardcoded.map((h) => h.symbol),
      chainDeployParams.uniswap.uniswapData.map((u) => u.lpName),
      chainDeployParams.uniswap.uniswapData.map((u) => u.lpSymbol),
      chainDeployParams.uniswap.uniswapData.map((u) => u.lpDisplayName)
    ]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("PoolLens initialized", tx);
  } else {
    console.log("PoolLens already initialized");
  }

  const fpls = await deployments.deploy("PoolLensSecondary", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (fpls.transactionHash) await publicClient.waitForTransactionReceipt({ hash: fpls.transactionHash as Hash });
  console.log("PoolLensSecondary: ", fpls.address);

  const fusePoolLensSecondary = await viem.getContractAt(
    "PoolLensSecondary",
    (await deployments.get("PoolLensSecondary")).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );
  directory = await fusePoolLensSecondary.read.directory();
  if (directory === zeroAddress) {
    const fusePoolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address,
      { client: { public: publicClient, wallet: walletClient } }
    );
    tx = await fusePoolLensSecondary.write.initialize([fusePoolDirectory.address]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("PoolLensSecondary initialized", tx);
  } else {
    console.log("PoolLensSecondary already initialized");
  }
};

func.tags = ["prod", "deploy-lens"];

export default func;
