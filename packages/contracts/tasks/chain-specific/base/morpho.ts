import { task, types } from "hardhat/config";
import { COMPTROLLER_MORPHO_IONIC } from ".";
import { Address } from "viem";
import { base } from "@ionicprotocol/chains";
import { assetSymbols } from "@ionicprotocol/types";

import { chainIdtoChain } from "@ionicprotocol/chains";

task("base:morpho:upgrade", "one time setup")
  .addParam("symbol", "CToken symbol", undefined, types.string)
  .addParam("name", "CToken name", undefined, types.string)
  .setAction(async (taskArgs, { viem, run, getNamedAccounts, getChainId, deployments }) => {
    const assetToUpgrade = assetSymbols.ionicUSDC;

    const { deployer } = await getNamedAccounts();
    const chainId = parseInt(await getChainId());
    const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
    const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });

    let tx;
    const fuseFeeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address,
      { client: { public: publicClient, wallet: walletClient } }
    );

    const cTokenFirstExtension = await viem.getContractAt(
      "CTokenFirstExtension",
      (await deployments.get("CTokenFirstExtension")).address as Address,
      { client: { public: publicClient, wallet: walletClient } }
    );

    const delegate = await deployments.deploy("CErc20RewardsDelegateMorpho", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1
    });

    try {
      tx = await fuseFeeDistributor.write._setCErc20DelegateExtensions([
        delegate.address as Address,
        [delegate.address as Address, cTokenFirstExtension.address as Address]
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`configured the extensions for the CErc20DelegateMorpho ${delegate.address}`);
    } catch (error) {
      console.error("Failed to configure the extensions for the CErc20DelegateMorpho:", error);
    }

    try {
      const tx = await fuseFeeDistributor.write._setLatestCErc20Delegate([5, delegate.address as Address, ""]);
      console.log("Transaction sent successfully. Hash:", tx);

      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("Transaction confirmed. Receipt:", receipt);
    } catch (error) {
      console.error("An error occurred during the transaction:", error);
    }

    const comptroller = await viem.getContractAt("IonicComptroller", COMPTROLLER_MORPHO_IONIC);
    const asset = base.assets.find((asset) => asset.symbol === assetToUpgrade);
    if (!asset) {
      throw `Asset ${assetToUpgrade} not found`;
    }
    const cToken = await comptroller.read.cTokensByUnderlying([asset.underlying]);
    await run("market:deploy", {
      underlying: asset.underlying,
      comptroller: comptroller,
      symbol: taskArgs.symbol,
      name: taskArgs.name
    });
  });
