import { task } from "hardhat/config";
import { base } from "@ionicprotocol/chains";
import { assetSymbols } from "@ionicprotocol/types";
import { COMPTROLLER } from ".";

task("markets:deploy:base:new", "deploy base market").setAction(async (_, { viem, run }) => {
  const assetsToDeploy: string[] = [assetSymbols.wsuperOETHb];
  for (const asset of base.assets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
    if (!asset.underlying || !asset.symbol) {
      throw new Error("Invalid asset");
    }
    await run("market:deploy", {
      signer: "deployer",
      cf: "0",
      underlying: asset.underlying,
      comptroller: COMPTROLLER,
      symbol: "ion" + asset.symbol,
      name: `Ionic ${asset.name}`
    });
    const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER);
    const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
    console.log(`Deployed ${asset.symbol} at ${cToken}`);

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

task("base:set-caps-hyusd", "one time setup").setAction(async (_, { viem, run }) => {
  const hyUsd = base.assets.find((asset) => asset.symbol === assetSymbols.hyUSD);
  if (!hyUsd) {
    throw new Error("hyUSD not found in base assets");
  }
  const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER);
  const cToken = await pool.read.cTokensByUnderlying([hyUsd.underlying]);

  await run("market:set-supply-cap", {
    market: cToken,
    maxSupply: hyUsd.initialSupplyCap
  });

  await run("market:set-borrow-cap", {
    market: cToken,
    maxBorrow: hyUsd.initialBorrowCap
  });
});

task("market:set-cf:base:new", "Sets CF on a market").setAction(async (_, { viem, run }) => {
  for (const asset of base.assets.filter((asset) => asset.symbol === assetSymbols.cbBTC)) {
    const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER);
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
