import { task } from "hardhat/config";
import { fraxtal } from "@ionicprotocol/chains";
import { assetSymbols } from "@ionicprotocol/types";
import { COMPTROLLER } from ".";
import { zeroAddress } from "viem";

const assets = fraxtal.assets;

task("markets:deploy:fraxtal:main", "deploy base market").setAction(async (_, { viem, run }) => {
  const assetsToDeploy: string[] = [
    //assetSymbols.WETH,
    assetSymbols.wFRXETH,
    assetSymbols.FRAX,
    assetSymbols.FXS
  ];
  for (const asset of assets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
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

    if (asset.initialSupplyCap) {
      await run("market:set-supply-cap", {
        market: cToken,
        maxSupply: asset.initialSupplyCap
      });
    }

    if (asset.initialBorrowCap) {
      await run("market:set-borrow-cap", {
        market: cToken,
        maxBorrow: asset.initialBorrowCap
      });
    }
  }
});

task("markets:fraxtal:set-cf", "deploy base market").setAction(async (_, { viem, run }) => {
  for (const asset of assets) {
    const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER);
    const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
    console.log("cToken: ", cToken, asset.symbol);
    if (cToken !== zeroAddress) {
      await run("market:set:ltv", {
        marketAddress: cToken,
        ltv: asset.initialCf
      });
    }
  }
});

task("markets:fraxtal:set-caps", "Set supply and borrow caps for markets").setAction(async (_, { viem, run }) => {
  const asset = assets.find((asset) => asset.symbol === assetSymbols.WETH);
  if (!asset) {
    throw new Error("Asset not found");
  }
  const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER);
  const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
  if (asset.initialSupplyCap) {
    await run("market:set-supply-cap", {
      market: cToken,
      maxSupply: asset.initialSupplyCap
    });
  }

  if (asset.initialBorrowCap) {
    await run("market:set-borrow-cap", {
      market: cToken,
      maxBorrow: asset.initialBorrowCap
    });
  }
});
