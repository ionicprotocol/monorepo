import { task } from "hardhat/config";
import { Address, formatUnits, parseEther, zeroAddress } from "viem";
import { assetSymbols } from "@ionicprotocol/types";

import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";
import { COMPTROLLER_MAIN } from ".";
import { getMarketInfo } from "../../market";
import { superseed } from "@ionicprotocol/chains";

const superseedAssets = superseed.assets;

task("markets:deploy:superseed:new", "deploy new superseed assets").setAction(async (_, { viem, run }) => {
  const assetsToDeploy: string[] = [assetSymbols.WETH];
  for (const asset of superseedAssets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
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
