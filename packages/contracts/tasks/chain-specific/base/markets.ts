import { task } from "hardhat/config";
import { base } from "@ionicprotocol/chains";
import { assetSymbols } from "@ionicprotocol/types";
import { COMPTROLLER, COMPTROLLER_MORPHO_IONIC, COMPTROLLER_MORPHO_SEAMLESS } from ".";
import { Address, zeroAddress } from "viem";
import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";
import { getMarketInfo } from "../../market";

task("markets:deploy:base:new", "deploy base market").setAction(
  async (_, { viem, run, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const assetsToDeploy: string[] = [assetSymbols.mBASIS];
    for (const asset of base.assets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
      console.log("Deploying market for ", asset.symbol, asset.name);
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds

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

      if (cToken !== zeroAddress) {
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
          await asExt.write._setAddressesProvider([ap.address as Address]);
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
    }
  }
);

task("base:set-caps:new", "one time setup").setAction(async (_, { viem, run, getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const assetsToDeploy: string[] = [assetSymbols.wUSDM];
  for (const asset of base.assets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
    const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER);
    const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
    const asExt = await viem.getContractAt("CTokenFirstExtension", cToken);
    const admin = await pool.read.admin();
    const ap = await deployments.get("AddressesProvider");
    // if (admin.toLowerCase() !== deployer.toLowerCase()) {
    //   await prepareAndLogTransaction({
    //     contractInstance: asExt,
    //     functionName: "_setAddressesProvider",
    //     args: [ap.address as Address],
    //     description: "Set Addresses Provider",
    //     inputs: [
    //       {
    //         internalType: "address",
    //         name: "_ap",
    //         type: "address"
    //       }
    //     ]
    //   });
    // } else {
    //   await asExt.write._setAddressesProvider([ap.address as Address]);
    // }

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

task("market:set-cf:base:new", "Sets CF on a market").setAction(async (_, { viem, run }) => {
  for (const asset of base.assets.filter((asset) => asset.symbol === assetSymbols.wUSDM)) {
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

task("base:get-market-info", "get market info").setAction(async (_, { viem, run }) => {
  await getMarketInfo(viem, COMPTROLLER);
});

task("markets:deploy:base:morpho-seamless", "deploy base market").setAction(
  async (_, { viem, run, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const assetsToDeploy: string[] = [assetSymbols.smUSDC /*assetSymbols.USDC, assetSymbols.ETH*/];
    for (const asset of base.assets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
      const marketName = `Ionic ${asset.name} Morpho (Seamless)`;
      const marketSymbol = `ion${asset.symbol}.morpho.seamless`;
      console.log("Deploying market for", asset.symbol, asset.name, marketSymbol, marketName);
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds

      if (!asset.underlying || !asset.symbol) {
        throw new Error("Invalid asset");
      }
      await run("market:deploy", {
        signer: "deployer",
        cf: "0",
        underlying: asset.underlying,
        comptroller: COMPTROLLER_MORPHO_SEAMLESS,
        symbol: marketSymbol,
        name: marketName
      });
      const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MORPHO_SEAMLESS);
      const cToken = await pool.read.cTokensByUnderlying([asset.underlying]);
      console.log(`Deployed ${asset.symbol} at ${cToken}`);

      if (cToken !== zeroAddress) {
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
          await asExt.write._setAddressesProvider([ap.address as Address]);
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
    }
  }
);

task("base:set-caps:morpho-seamless", "one time setup").setAction(
  async (_, { viem, run, getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const assetsToDeploy: string[] = [assetSymbols.smUSDC, assetSymbols.USDC];
    for (const asset of base.assets.filter((asset) => assetsToDeploy.includes(asset.symbol))) {
      const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MORPHO_SEAMLESS);
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
        await asExt.write._setAddressesProvider([ap.address as Address]);
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

task("market:set-cf:base:morpho-ionic", "Sets CF on a market").setAction(async (_, { viem, run }) => {
  for (const asset of base.assets.filter((asset) =>
    [assetSymbols.ionicUSDC, assetSymbols.ionicWETH, assetSymbols.WETH, assetSymbols.USDC].includes(asset.symbol as any)
  )) {
    const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MORPHO_IONIC);
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

task("market:set-cf:base:morpho-seamless", "Sets CF on a market").setAction(async (_, { viem, run }) => {
  for (const asset of base.assets.filter((asset) =>
    [assetSymbols.smUSDC, assetSymbols.USDC].includes(asset.symbol as any)
  )) {
    const pool = await viem.getContractAt("IonicComptroller", COMPTROLLER_MORPHO_SEAMLESS);
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