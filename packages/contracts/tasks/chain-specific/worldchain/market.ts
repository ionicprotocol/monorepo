import { task } from "hardhat/config";
import { Address, formatUnits, parseEther, zeroAddress } from "viem";
import { assetSymbols } from "@ionicprotocol/types";

import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";
import { getMarketInfo } from "../../market";
import { worldchain } from "@ionicprotocol/chains";
import { COMPTROLLER_MAIN } from ".";

const worldchainAssets = worldchain.assets;

task("markets:deploy:worldchain:new", "deploy new worldchain assets").setAction(
  async (_, { viem, run, deployments }) => {
    const assetsToDeploy: string[] = [assetSymbols.WETH];
    for (const asset of worldchainAssets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
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
      const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MAIN);
      const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
      console.log(`Deployed ${asset.symbol} at ${cToken}`);

      if (cToken !== zeroAddress) {
        const ap = await deployments.get("AddressesProvider");
        const asExt = await viem.getContractAt("CTokenFirstExtension", cToken);
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

task("worldchain:set-caps:new", "one time setup").setAction(async (_, { viem, run, getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const assetsToDeploy: string[] = [assetSymbols.WETH];
  for (const asset of worldchain.assets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
    const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MAIN);
    const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
    const asExt = await viem.getContractAt("CTokenFirstExtension", cToken);
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
});

task("market:set-cf:worldchain:new", "Sets CF on a market").setAction(async (_, { viem, run }) => {
  for (const asset of worldchain.assets.filter((asset) => asset.symbol === assetSymbols.WETH)) {
    const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MAIN);
    const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
    console.log("cToken: ", cToken, asset.symbol);

    if (asset.initialCf) {
      await run("market:set:ltv", {
        marketAddress: cToken,
        ltv: asset.initialCf
      });
    }
  }
});
