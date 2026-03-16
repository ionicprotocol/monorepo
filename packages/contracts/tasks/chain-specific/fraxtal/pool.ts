import { task } from "hardhat/config";
import { Address, Hash, parseEther } from "viem";
import { chainIdtoChain } from "@ionicprotocol/chains";
import { chainDeployConfig, ChainDeployConfig } from "../../../chainDeploy";

task("pool:create:fraxtal").setAction(async ({}, { run, deployments }) => {
  const oracle = await deployments.get("MasterPriceOracle");
  console.log("oracle: ", oracle.address);
  await run("pool:create", {
    name: "Fraxtal Market",
    creator: "deployer",
    priceOracle: oracle.address, // MPO
    closeFactor: "50",
    liquidationIncentive: "8",
    enforceWhitelist: "false"
  });
});

task(
  "fix:fraxtal",
  "Deploy IonicUniV3Liquidator, set health threshold to 1 ether, and set address in AddressesProvider"
).setAction(async ({}, { viem, deployments, getChainId, getNamedAccounts }) => {
  const chainId = parseInt(await getChainId());
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
  const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });

  console.log("\n=== Fix Fraxtal: Deploy IonicUniV3Liquidator ===\n");

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];

  try {
    // Check if already deployed
    let ionicUniV3LiquidatorDeployment;
    try {
      ionicUniV3LiquidatorDeployment = await deployments.get("IonicUniV3Liquidator");
      console.log(`IonicUniV3Liquidator already deployed at: ${ionicUniV3LiquidatorDeployment.address}`);
    } catch {
      // Deploy IonicUniV3Liquidator
      console.log("Deploying IonicUniV3Liquidator...");
      const wtoken = chainDeployParams.wtoken;
      const uniswapV3Quoter = chainDeployParams.uniswap.uniswapV3Quoter;

      if (!wtoken || wtoken === "0x0000000000000000000000000000000000000000") {
        throw new Error("wtoken not configured for this chain");
      }

      ionicUniV3LiquidatorDeployment = await deployments.deploy("IonicUniV3Liquidator", {
        from: deployer,
        log: true,
        proxy: {
          execute: {
            init: {
              methodName: "initialize",
              args: [wtoken, uniswapV3Quoter || "0x0000000000000000000000000000000000000000"]
            }
          },
          proxyContract: "OpenZeppelinTransparentProxy"
        }
      });

      if (ionicUniV3LiquidatorDeployment.transactionHash) {
        await publicClient.waitForTransactionReceipt({ hash: ionicUniV3LiquidatorDeployment.transactionHash as Hash });
      }
      console.log(`IonicUniV3Liquidator deployed at: ${ionicUniV3LiquidatorDeployment.address}`);
    }

    const ionicUniV3LiquidatorAddress = ionicUniV3LiquidatorDeployment.address as Address;

    // Get the contract instance
    const ionicUniV3Liquidator = await viem.getContractAt("IonicUniV3Liquidator", ionicUniV3LiquidatorAddress, {
      client: { public: publicClient, wallet: walletClient }
    });

    // Set health factor threshold to 1 ether
    console.log("\nSetting health factor threshold to 1 ether...");
    const healthFactorThreshold = parseEther("1");
    const currentThreshold = await ionicUniV3Liquidator.read.healthFactorThreshold().catch(() => 0n);

    if (currentThreshold !== healthFactorThreshold) {
      const hfTx = await ionicUniV3Liquidator.write.setHealthFactorThreshold([healthFactorThreshold]);
      await publicClient.waitForTransactionReceipt({ hash: hfTx });
      console.log(`Health Factor Threshold set to ${healthFactorThreshold.toString()} at ${hfTx}`);
    } else {
      console.log("Health Factor Threshold already set to 1 ether");
    }

    // Set address in AddressesProvider
    console.log("\nSetting IonicUniV3Liquidator address in AddressesProvider...");
    const apDeployment = await deployments.get("AddressesProvider");
    const addressesProvider = (await viem.getContractAt("AddressesProvider" as any, apDeployment.address as Address, {
      client: { public: publicClient, wallet: walletClient }
    })) as any;

    const currentAddress = await addressesProvider.read.getAddress(["IonicUniV3Liquidator"]);
    console.log(`Current IonicUniV3Liquidator address in AddressesProvider: ${currentAddress}`);

    if (currentAddress.toLowerCase() === ionicUniV3LiquidatorAddress.toLowerCase()) {
      console.log("IonicUniV3Liquidator address is already set correctly in AddressesProvider.");
    } else {
      const txHash = await addressesProvider.write.setAddress(["IonicUniV3Liquidator", ionicUniV3LiquidatorAddress]);
      console.log(`Transaction hash: ${txHash}`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
      console.log("IonicUniV3Liquidator address successfully set on AddressesProvider.");
    }

    console.log("\n✅ Fix Fraxtal completed successfully!");
  } catch (error) {
    console.log(`Error in fix:fraxtal: ${error}`);
    throw error;
  }
});
