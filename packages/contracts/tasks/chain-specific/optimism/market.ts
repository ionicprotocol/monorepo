import { task } from "hardhat/config";
import { zeroAddress } from "viem";
import { assetSymbols } from "@ionicprotocol/types";
import { COMPTROLLER_MAIN } from ".";
import { optimism } from "@ionicprotocol/chains";

task("markets:deploy:optimism:new", "deploy new mode assets").setAction(async (_, { viem, run }) => {
  const assetsToDeploy: string[] = [assetSymbols.wUSDM];
  for (const asset of optimism.assets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
    if (!asset.name || !asset.symbol || !asset.underlying) {
      throw new Error(`Asset ${asset.symbol} has no name, symbol or underlying`);
    }
    const name = `Ionic ${asset.name}`;
    const symbol = "ion" + asset.symbol;
    console.log(`Deploying ctoken ${name} with symbol ${symbol}`);
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
});

task("market:set-caps:optimism:new", "Sets CF on a market").setAction(async (_, { viem, run }) => {
  for (const asset of optimism.assets.filter((asset) => asset.symbol === assetSymbols.SNX)) {
    const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MAIN);
    const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
    console.log("cToken: ", cToken, asset.symbol);

    if (asset.initialCf) {
      await run("market:set:ltv", {
        marketAddress: cToken,
        ltv: asset.initialCf
      });
    }

    await run("market:set-supply-cap", {
      market: cToken,
      maxSupply: asset.initialSupplyCap
    });

    await run("market:set-borrow-cap", {
      market: cToken,
      maxBorrow: asset.initialBorrowCap
    });
  }
});
