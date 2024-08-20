import { task } from "hardhat/config";
import { bob } from "@ionicprotocol/chains";
const bobAssets = bob.assets;

task("market:set-cf:bob:main", "Sets caps on a market").setAction(async (_, { viem, run }) => {
  const COMPTROLLER = "0x9cFEe81970AA10CC593B83fB96eAA9880a6DF715";
  for (const asset of bobAssets) {
    const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER);
    const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
    console.log("cToken: ", cToken, asset.symbol);

    await run("market:set:ltv", {
      marketAddress: cToken,
      ltv: asset.initialCf
    });
  }
});
