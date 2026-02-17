import { task } from "hardhat/config";
import { Address, parseEther, zeroAddress } from "viem";
import { chainIdtoChain } from "@ionicprotocol/chains";
import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";
import { COMPTROLLER_MAIN, WETH_MARKET, USDC_MARKET, LSK_MARKET, USDT_MARKET, WBTC_MARKET } from ".";

const LIQUIDATE_BORROW_SELECTOR = "0xf5e3c462"; // liquidateBorrow(address,uint256,address)

task("lisk:open-liquidations", "Open Lisk pool for permissionless liquidation").setAction(
  async (_, { viem, getNamedAccounts, deployments, getChainId }) => {
    const chainId = await getChainId();

    // Built inside the callback to avoid circular-import timing issues with index.ts
    const MARKETS: { name: string; address: Address }[] = [
      { name: "WETH", address: WETH_MARKET as Address },
      { name: "USDC", address: USDC_MARKET as Address },
      { name: "LSK", address: LSK_MARKET as Address },
      { name: "USDT", address: USDT_MARKET as Address },
      { name: "WBTC", address: WBTC_MARKET as Address }
    ];
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[+chainId] });
    const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[+chainId] });

    // ─── Step 0: Register IonicUniV3Liquidator in AddressesProvider ───
    console.log("\n=== Step 0: Register IonicUniV3Liquidator in AddressesProvider ===");

    const addressesProvider = await viem.getContractAt(
      "AddressesProvider",
      (await deployments.get("AddressesProvider")).address as Address,
      { client: { public: publicClient, wallet: walletClient } }
    );

    const liquidatorAddress = (await deployments.get("IonicUniV3Liquidator")).address as Address;
    const currentLiquidatorInAP = await addressesProvider.read.getAddress(["IonicUniV3Liquidator"]);
    console.log(`Current AddressesProvider value for IonicUniV3Liquidator: ${currentLiquidatorInAP}`);
    console.log(`Expected value: ${liquidatorAddress}`);

    if (currentLiquidatorInAP.toLowerCase() === liquidatorAddress.toLowerCase()) {
      console.log("IonicUniV3Liquidator already registered in AddressesProvider — skipping");
    } else {
      const apOwner = await addressesProvider.read.owner();
      if (deployer.toLowerCase() === apOwner.toLowerCase()) {
        console.log("Deployer is owner — sending tx directly...");
        const tx = await addressesProvider.write.setAddress(["IonicUniV3Liquidator", liquidatorAddress]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`IonicUniV3Liquidator registered in AddressesProvider at tx: ${tx}`);
      } else {
        console.log(`Deployer (${deployer}) is NOT owner (${apOwner}) — preparing Safe batch tx...`);
        await prepareAndLogTransaction({
          contractInstance: addressesProvider,
          functionName: "setAddress",
          args: ["IonicUniV3Liquidator", liquidatorAddress],
          description: "Register IonicUniV3Liquidator in AddressesProvider",
          inputs: [
            { internalType: "string", name: "id", type: "string" },
            { internalType: "address", name: "newAddress", type: "address" }
          ]
        });
      }
    }

    // ─── Step A: Set healthFactorThreshold to 1e18 on IonicUniV3Liquidator ───
    console.log("\n=== Step A: IonicUniV3Liquidator healthFactorThreshold ===");

    const ionicUniV3Liquidator = await viem.getContractAt(
      "IonicUniV3Liquidator",
      (await deployments.get("IonicUniV3Liquidator")).address as Address,
      { client: { public: publicClient, wallet: walletClient } }
    );

    const currentThreshold = await ionicUniV3Liquidator.read.healthFactorThreshold();
    const targetThreshold = parseEther("1");
    console.log(`Current healthFactorThreshold: ${currentThreshold}`);
    console.log(`Target healthFactorThreshold:  ${targetThreshold}`);

    if (currentThreshold === targetThreshold) {
      console.log("healthFactorThreshold already set to 1e18 — skipping");
    } else {
      const liquidatorOwner = await ionicUniV3Liquidator.read.owner();
      if (liquidatorOwner.toLowerCase() === deployer.toLowerCase()) {
        console.log("Deployer is owner — sending tx directly...");
        const tx = await ionicUniV3Liquidator.write.setHealthFactorThreshold([targetThreshold]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`healthFactorThreshold set to ${targetThreshold} at tx: ${tx}`);
      } else {
        console.log(`Deployer (${deployer}) is NOT owner (${liquidatorOwner}) — preparing Safe batch tx...`);
        await prepareAndLogTransaction({
          contractInstance: ionicUniV3Liquidator,
          functionName: "setHealthFactorThreshold",
          args: [targetThreshold.toString()],
          description: "Setting Liquidator Health Factor Threshold to 1e18",
          inputs: [{ internalType: "uint256", name: "_healthFactorThreshold", type: "uint256" }]
        });
      }
    }

    // ─── Step B: Open liquidation capabilities on PoolRolesAuthority ───
    console.log("\n=== Step B: PoolRolesAuthority — open liquidation capabilities ===");

    const authRegistry = await viem.getContractAt(
      "AuthoritiesRegistry",
      (await deployments.get("AuthoritiesRegistry")).address as Address,
      { client: { public: publicClient, wallet: walletClient } }
    );

    const poolAuthAddress = await authRegistry.read.poolsAuthorities([COMPTROLLER_MAIN as Address]);
    if (poolAuthAddress === zeroAddress) {
      console.log(`Pool authority for ${COMPTROLLER_MAIN} does not exist — cannot proceed`);
      return;
    }
    console.log(`PoolRolesAuthority: ${poolAuthAddress}`);

    const poolRolesAuth = await viem.getContractAt("PoolRolesAuthority", poolAuthAddress, {
      client: { public: publicClient, wallet: walletClient }
    });

    // Check isPublicCapability for each market's liquidateBorrow selector
    let allOpen = true;
    for (const market of MARKETS) {
      const isPublic = await poolRolesAuth.read.isCapabilityPublic([market.address, LIQUIDATE_BORROW_SELECTOR]);
      console.log(`  ${market.name} (${market.address}): isPublicCapability = ${isPublic}`);
      if (!isPublic) {
        allOpen = false;
      }
    }

    if (allOpen) {
      console.log("All markets already have public liquidateBorrow — skipping");
    } else {
      console.log("Opening pool liquidator capabilities...");
      const tx = await (poolRolesAuth as any).write.configureOpenPoolLiquidatorCapabilities([COMPTROLLER_MAIN as Address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`configureOpenPoolLiquidatorCapabilities tx: ${tx}`);

      // Verify
      console.log("\nVerifying...");
      for (const market of MARKETS) {
        const isPublic = await poolRolesAuth.read.isCapabilityPublic([market.address, LIQUIDATE_BORROW_SELECTOR]);
        console.log(`  ${market.name}: isPublicCapability = ${isPublic}`);
      }
    }

    console.log("\n=== Done ===");
  }
);
