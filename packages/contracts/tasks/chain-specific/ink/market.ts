import { task } from "hardhat/config";
import { Address, zeroAddress } from "viem";
import { assetSymbols } from "@ionicprotocol/types";

import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";
import { chainIdtoChain, ink } from "@ionicprotocol/chains";
import { COMPTROLLER_MAIN } from ".";

const inkAssets = ink.assets;

task("markets:deploy:ink:new", "deploy new ink assets").setAction(
  async (_, { viem, run, deployments, getNamedAccounts, getChainId }) => {
    const { deployer } = await getNamedAccounts();
    const chainId = parseInt(await getChainId());
    const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
    const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });
    const assetsToDeploy: string[] = [assetSymbols.WETH];
    for (const asset of inkAssets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
      if (!asset.name || !asset.symbol || !asset.underlying) {
        throw new Error(`Asset ${asset.symbol} has no name, symbol or underlying`);
      }
      const name = `Ionic ${asset.name}`;
      const symbol = "ion" + asset.symbol;
      console.log(`Deploying ctoken ${name} with symbol ${symbol}`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      await run("market:deploy", {
        signer: "deployer",
        cf: "0",
        underlying: asset.underlying,
        comptroller: COMPTROLLER_MAIN,
        symbol,
        name
      });
      const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MAIN, {
        client: { public: publicClient, wallet: walletClient }
      });
      const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
      console.log(`Deployed ${asset.symbol} at ${cToken}`);

      if (cToken !== zeroAddress) {
        const ap = await deployments.get("AddressesProvider");
        const asExt = await viem.getContractAt("CTokenFirstExtension", cToken, {
          client: { public: publicClient, wallet: walletClient }
        });
        const tx = await asExt.write._setAddressesProvider([ap.address as Address]);
        console.log("set addresses provider", tx);

        await run("market:set-supply-cap", {
          market: cToken,
          maxSupply: asset.initialSupplyCap
        });

        await run("market:set-borrow-cap", {
          market: cToken,
          maxBorrow: asset.initialBorrowCap
        });
      }
    }
  }
);

task("ink:set-caps:new", "one time setup").setAction(
  async (_, { viem, run, getNamedAccounts, deployments, getChainId }) => {
    const { deployer } = await getNamedAccounts();
    const chainId = parseInt(await getChainId());
    const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
    const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });
    const assetsToDeploy: string[] = [assetSymbols.WETH];
    for (const asset of ink.assets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
      const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MAIN, {
        client: { public: publicClient, wallet: walletClient }
      });
      const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
      const asExt = await viem.getContractAt("CTokenFirstExtension", cToken, {
        client: { public: publicClient, wallet: walletClient }
      });
      const admin = await pool.read.admin();
      const ap = await deployments.get("AddressesProvider");
      if (admin.toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: asExt,
          functionName: "_setAddressesProvider",
          args: [ap.address as Address],
          description: "Set Addresses Provider",
          inputs: [
            {
              internalType: "address",
              name: "_ap",
              type: "address"
            }
          ]
        });
      } else {
        const tx = await asExt.write._setAddressesProvider([ap.address as Address]);
        console.log("set addresses provider", tx);
      }

      await run("market:set-borrow-cap", {
        market: cToken,
        maxBorrow: asset.initialBorrowCap
      });

      await run("market:set-supply-cap", {
        market: cToken,
        maxSupply: asset.initialSupplyCap
      });
    }
  }
);

task("market:set-cf:ink:new", "Sets CF on a market").setAction(
  async (_, { viem, run, getNamedAccounts, getChainId }) => {
    const { deployer } = await getNamedAccounts();
    const chainId = parseInt(await getChainId());
    const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
    const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });
    for (const asset of ink.assets.filter((asset) => asset.symbol === assetSymbols.WETH)) {
      const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MAIN, {
        client: { public: publicClient, wallet: walletClient }
      });
      const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
      console.log("cToken: ", cToken, asset.symbol);

      if (asset.initialCf) {
        await run("market:set:ltv", {
          marketAddress: cToken,
          ltv: asset.initialCf
        });
      }
    }
  }
);
