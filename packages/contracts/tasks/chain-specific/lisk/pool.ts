import { task } from "hardhat/config";
import { Address } from "viem";
import { chainIdtoChain } from "@ionicprotocol/chains";

task("pool:create:lisk:main").setAction(async ({}, { run, deployments }) => {
  const mpo = await deployments.get("MasterPriceOracle");
  await run("pool:create", {
    name: "Lisk Main Market",
    creator: "deployer",
    priceOracle: mpo.address, // MPO
    closeFactor: "50",
    liquidationIncentive: "8",
    enforceWhitelist: "false"
  });
});

task("pool:list:lisk", "List all active pools and AddressesProvider addresses").setAction(
  async ({}, { viem, deployments, getChainId, getNamedAccounts }) => {
    const chainId = parseInt(await getChainId());
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
    const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });

    // First, show AddressesProvider information
    const apDeployment = await (deployments as any).get("AddressesProvider");
    const addressesProvider = (await viem.getContractAt("AddressesProvider" as any, apDeployment.address as Address, {
      client: { public: publicClient, wallet: walletClient }
    })) as any;

    console.log("\n=== AddressesProvider ===\n");
    console.log(`AddressesProvider: ${apDeployment.address}\n`);

    const addressKeys = [
      "IonicUniV3Liquidator",
      "PoolLens",
      "UniswapV2Liquidator",
      "IUniswapV2Router02",
      "UNISWAP_V3_ROUTER",
      "ALGEBRA_SWAP_ROUTER",
      "SOLIDLY_SWAP_ROUTER",
      "CurveLpTokenLiquidatorNoRegistry",
      "IUniswapV2Factory",
      "wtoken",
      "wBTCToken",
      "stableToken",
      "deployer",
      "DefaultProxyAdmin"
    ];

    console.log("Addresses from AddressesProvider:\n");
    let ionicUniV3LiquidatorAddress: Address | null = null;
    for (const key of addressKeys) {
      try {
        const address = await addressesProvider.read.getAddress([key]);
        if (address && address !== "0x0000000000000000000000000000000000000000") {
          console.log(`  ${key}: ${address}`);
          if (key === "IonicUniV3Liquidator") {
            ionicUniV3LiquidatorAddress = address as Address;
          }
        } else {
          console.log(`  ${key}: Not set (zero address)`);
        }
      } catch (error) {
        console.log(`  ${key}: Error - ${error}`);
      }
    }

    // Query healthFactorThreshold from IonicUniV3Liquidator if available
    if (ionicUniV3LiquidatorAddress) {
      try {
        const ionicUniV3Liquidator = await viem.getContractAt("IonicUniV3Liquidator", ionicUniV3LiquidatorAddress, {
          client: { public: publicClient, wallet: walletClient }
        });
        const healthFactorThreshold = await ionicUniV3Liquidator.read.healthFactorThreshold().catch(() => null);
        if (healthFactorThreshold !== null) {
          console.log(`\nIonicUniV3Liquidator healthFactorThreshold: ${healthFactorThreshold}`);
        }
      } catch (error) {
        console.log(`\nError querying IonicUniV3Liquidator healthFactorThreshold: ${error}`);
      }
    }

    // Then, show pool information
    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address,
      { client: { public: publicClient, wallet: walletClient } }
    );

    const [poolIds, poolData] = await poolDirectory.read.getActivePools();

    console.log("\n=== Active Pools ===\n");
    console.log(`Total active pools: ${poolIds.length}\n`);

    if (poolIds.length === 0) {
      console.log("No active pools found.");
      return;
    }

    for (let i = 0; i < poolIds.length; i++) {
      const poolId = poolIds[i];
      const pool = poolData[i];

      console.log(`Pool ID: ${poolId}`);
      console.log(`  Name: ${pool.name}`);
      console.log(`  Comptroller: ${pool.comptroller}`);

      // Get pool configuration from comptroller
      try {
        const comptroller = await viem.getContractAt("IonicComptroller", pool.comptroller, {
          client: { public: publicClient, wallet: walletClient }
        });

        // Get pool configuration
        const [oracle, closeFactorMantissa, liquidationIncentiveMantissa, enforceWhitelist] = await Promise.all([
          comptroller.read.oracle().catch(() => "N/A"),
          comptroller.read.closeFactorMantissa().catch(() => 0n),
          comptroller.read.liquidationIncentiveMantissa().catch(() => 0n),
          comptroller.read.enforceWhitelist().catch(() => false)
        ]);

        // Convert mantissas to percentages (mantissa / 1e18 * 100)
        const closeFactor = closeFactorMantissa ? Number(closeFactorMantissa) / 1e16 : 0;
        const liquidationIncentive = liquidationIncentiveMantissa ? Number(liquidationIncentiveMantissa) / 1e16 : 0;

        console.log(`  Price Oracle: ${oracle}`);
        console.log(`  Close Factor: ${closeFactor}%`);
        console.log(`  Liquidation Incentive: ${liquidationIncentive}%`);
        console.log(`  Enforce Whitelist: ${enforceWhitelist}`);

        // Get all markets for this pool
        const markets = await comptroller.read.getAllMarkets();

        console.log(`  Markets (${markets.length}):`);
        if (markets.length === 0) {
          console.log(`    No markets found`);
        } else {
          for (const market of markets) {
            try {
              const marketContract = await viem.getContractAt("CTokenFirstExtension", market, {
                client: { public: publicClient, wallet: walletClient }
              });
              const [marketName, marketSymbol, underlyingAddress, apAddress] = await Promise.all([
                marketContract.read.name().catch(() => "N/A"),
                marketContract.read.symbol().catch(() => "N/A"),
                marketContract.read.underlying().catch(() => "0x0000000000000000000000000000000000000000" as Address),
                marketContract.read.ap().catch(() => "0x0000000000000000000000000000000000000000" as Address)
              ]);

              console.log(`    - ${marketName} (${marketSymbol})`);
              console.log(`      Market Address: ${market}`);

              // Get underlying token info
              if (underlyingAddress !== "0x0000000000000000000000000000000000000000") {
                try {
                  const underlyingContract = (await viem.getContractAt("EIP20Interface" as any, underlyingAddress, {
                    client: { public: publicClient, wallet: walletClient }
                  })) as any;
                  const [underlyingName, underlyingSymbol] = await Promise.all([
                    underlyingContract.read.name().catch(() => "N/A"),
                    underlyingContract.read.symbol().catch(() => "N/A")
                  ]);
                  console.log(`      Underlying Token: ${underlyingName} (${underlyingSymbol})`);
                  console.log(`      Underlying Address: ${underlyingAddress}`);
                } catch (error) {
                  console.log(`      Underlying Address: ${underlyingAddress} (Error getting token info: ${error})`);
                }
              } else {
                console.log(`      Underlying Token: Native token (no underlying)`);
              }

              console.log(`      AddressesProvider (ap): ${apAddress}`);
            } catch (error) {
              console.log(`    - ${market}`);
              console.log(`      Error fetching market data: ${error}`);
            }
          }
        }
      } catch (error) {
        console.log(`  Error fetching pool data: ${error}`);
      }

      console.log("");
    }
  }
);

task(
  "ionic-uni-v3-liquidator:health-factor-threshold",
  "Get health factor threshold from IonicUniV3Liquidator"
).setAction(async ({}, { viem, deployments, getChainId, getNamedAccounts }) => {
  const chainId = parseInt(await getChainId());
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
  const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });

  console.log("\n=== IonicUniV3Liquidator Health Factor Threshold ===\n");

  try {
    const ionicUniV3LiquidatorDeployment = await deployments.get("IonicUniV3Liquidator");
    const ionicUniV3LiquidatorAddress = ionicUniV3LiquidatorDeployment.address as Address;

    console.log(`IonicUniV3Liquidator Address: ${ionicUniV3LiquidatorAddress}\n`);

    const ionicUniV3Liquidator = await viem.getContractAt("IonicUniV3Liquidator", ionicUniV3LiquidatorAddress, {
      client: { public: publicClient, wallet: walletClient }
    });

    const healthFactorThreshold = await ionicUniV3Liquidator.read.healthFactorThreshold();

    // Format as decimal (healthFactorThreshold is stored as uint256, likely in 1e18 format)
    const formattedThreshold = Number(healthFactorThreshold) / 1e18;

    console.log(`Health Factor Threshold (raw): ${healthFactorThreshold}`);
    console.log(`Health Factor Threshold (formatted): ${formattedThreshold}`);
  } catch (error) {
    console.log(`Error querying IonicUniV3Liquidator healthFactorThreshold: ${error}`);
  }
});

task("fix:lisk", "Set IonicUniV3Liquidator address on AddressesProvider").setAction(
  async ({}, { viem, deployments, getChainId, getNamedAccounts }) => {
    const chainId = parseInt(await getChainId());
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
    const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });

    console.log("\n=== Setting IonicUniV3Liquidator on AddressesProvider ===\n");

    try {
      // Get IonicUniV3Liquidator deployment
      const ionicUniV3LiquidatorDeployment = await deployments.get("IonicUniV3Liquidator");
      const ionicUniV3LiquidatorAddress = ionicUniV3LiquidatorDeployment.address as Address;

      console.log(`IonicUniV3Liquidator Address: ${ionicUniV3LiquidatorAddress}`);

      // Get AddressesProvider
      const apDeployment = await deployments.get("AddressesProvider");
      const addressesProvider = (await viem.getContractAt("AddressesProvider" as any, apDeployment.address as Address, {
        client: { public: publicClient, wallet: walletClient }
      })) as any;

      // Check current value
      const currentAddress = await addressesProvider.read.getAddress(["IonicUniV3Liquidator"]);
      console.log(`Current IonicUniV3Liquidator address in AddressesProvider: ${currentAddress}`);

      if (currentAddress.toLowerCase() === ionicUniV3LiquidatorAddress.toLowerCase()) {
        console.log("IonicUniV3Liquidator address is already set correctly.");
        return;
      }

      // Set the address
      console.log(`Setting IonicUniV3Liquidator address to ${ionicUniV3LiquidatorAddress}...`);
      const txHash = await addressesProvider.write.setAddress(["IonicUniV3Liquidator", ionicUniV3LiquidatorAddress]);
      console.log(`Transaction hash: ${txHash}`);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
      console.log("IonicUniV3Liquidator address successfully set on AddressesProvider.");
    } catch (error) {
      console.log(`Error setting IonicUniV3Liquidator address: ${error}`);
      throw error;
    }
  }
);
