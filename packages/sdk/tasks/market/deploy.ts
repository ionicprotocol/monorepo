import { assetFilter, assetSymbols, MarketConfig } from "@ionicprotocol/types";
import { task, types } from "hardhat/config";

import { assets as baseAssets } from "../../../chains/src/base/assets";
import { assets as modeAssets } from "../../../chains/src/mode/assets";
import { assets as optimismAssets } from "../../../chains/src/optimism/assets";
import { IonicComptroller } from "../../typechain/ComptrollerInterface.sol/IonicComptroller";

task("markets:deploy:mode", "deploy mode markets").setAction(async (taskArgs, { run }) => {
  const symbols = [
    // assetSymbols.WETH,
    // assetSymbols.USDC,
    // assetSymbols.USDT,
    // assetSymbols.DAI,
    // assetSymbols.LINK,
    // assetSymbols.BAL,
    // assetSymbols.SNX,
    // assetSymbols.UNI,
    // assetSymbols.WBTC
    // assetSymbols.AAVE
    assetSymbols.weETH
    // assetSymbols.wrsETH,
    // assetSymbols.mBTC
  ];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const asset = assetFilter(modeAssets, symbol);
    await run("market:deploy", {
      signer: "deployer",
      cf: "70",
      underlying: asset.underlying,
      comptroller: "0xFB3323E24743Caf4ADD0fDCCFB268565c0685556",
      symbol: "ion" + asset.symbol,
      name: `Ionic ${asset.name}`
    });
  }
});

task("markets:deploy:modenative", "deploy mode native markets").setAction(async (taskArgs, { run }) => {
  const symbols = [
    // { symbol: assetSymbols.WETH, cf: "82.5" },
    // { symbol: assetSymbols.USDC, cf: "90" },
    // { symbol: assetSymbols.USDT, cf: "90" },
    { symbol: assetSymbols.MODE, cf: "35" }
  ];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const asset = assetFilter(modeAssets, symbol.symbol);
    await run("market:deploy", {
      signer: "deployer",
      cf: symbol.cf,
      underlying: asset.underlying,
      comptroller: "0x8Fb3D4a94D0aA5D6EDaAC3Ed82B59a27f56d923a",
      symbol: "ion" + asset.symbol + ".modenative",
      name: `Ionic ${asset.name} - Mode Native Market`
    });
  }
});

task("markets:deploy:base", "deploy base markets").setAction(async (_, { run, ethers }) => {
  const comptroller = "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13";
  for (const asset of baseAssets.filter((asset) => asset.symbol === assetSymbols.bsdETH)) {
    await run("market:deploy", {
      signer: "deployer",
      cf: "0", // set initial cf to 0
      underlying: asset.underlying,
      comptroller,
      symbol: "ion" + asset.symbol,
      name: `Ionic ${asset.name}`
    });
    const pool = (await ethers.getContractAt("IonicComptroller", comptroller)) as IonicComptroller;
    const cToken = await pool.cTokensByUnderlying(asset.underlying);
    console.log("cToken: ", cToken);

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

task("market:set-caps:base", "Sets caps on a market").setAction(async (_, { ethers, run }) => {
  const COMPTROLLER = "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13";
  for (const asset of baseAssets) {
    const pool = (await ethers.getContractAt("IonicComptroller", COMPTROLLER)) as IonicComptroller;
    const cToken = await pool.cTokensByUnderlying(asset.underlying);
    console.log("cToken: ", cToken);
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

task("market:set-cf:base", "Sets caps on a market").setAction(async (_, { ethers, run }) => {
  const COMPTROLLER = "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13";
  for (const asset of baseAssets) {
    const pool = (await ethers.getContractAt("IonicComptroller", COMPTROLLER)) as IonicComptroller;
    const cToken = await pool.cTokensByUnderlying(asset.underlying);
    console.log("cToken: ", cToken);
    if (asset.initialCf) {
      await run("market:set:ltv", {
        marketAddress: cToken,
        ltv: asset.initialCf
      });
    } else {
      console.log("No CF available for ", asset.symbol);
    }
  }
});

task("markets:deploy:optimism:main", "deploy op main market").setAction(async (_, { ethers, run }) => {
  const COMPTROLLER = "0xaFB4A254D125B0395610fdc8f1D022936c7b166B";
  for (const asset of optimismAssets) {
    await run("market:deploy", {
      signer: "deployer",
      cf: asset.initialCf,
      underlying: asset.underlying,
      comptroller: "0xaFB4A254D125B0395610fdc8f1D022936c7b166B",
      symbol: "ion" + asset.symbol,
      name: `Ionic ${asset.name}`
    });
    const pool = (await ethers.getContractAt("IonicComptroller", COMPTROLLER)) as IonicComptroller;
    const cToken = await pool.cTokensByUnderlying(asset.underlying);
    console.log("cToken: ", cToken);

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

task("market:set-caps:optimism:main", "Sets caps on a market").setAction(async (_, { ethers, run }) => {
  const COMPTROLLER = "0xaFB4A254D125B0395610fdc8f1D022936c7b166B";
  for (const asset of optimismAssets) {
    const pool = (await ethers.getContractAt("IonicComptroller", COMPTROLLER)) as IonicComptroller;
    const cToken = await pool.cTokensByUnderlying(asset.underlying);
    console.log("cToken: ", cToken);

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

task("market:deploy", "deploy market")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("cf", "Collateral factor", "80", types.string)
  .addParam("underlying", "Asset token address", undefined, types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("symbol", "CToken symbol", undefined, types.string)
  .addParam("name", "CToken name", undefined, types.string)
  .addOptionalParam("initialSupplyCap", "Initial supply cap", undefined, types.string)
  .addOptionalParam("initialBorrowCap", "Initial borrow cap", undefined, types.string)
  .setAction(async (taskArgs, { ethers, getChainId }) => {
    const chainId = await getChainId();
    const signer = await ethers.getNamedSigner(taskArgs.signer);
    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(signer);
    const comptroller = sdk.createComptroller(taskArgs.comptroller, signer);

    const abiCoder = new ethers.utils.AbiCoder();

    const delegateType = 1;
    const implementationData = "0x00";

    const config: MarketConfig = {
      underlying: taskArgs.underlying,
      comptroller: comptroller.address,
      adminFee: 10,
      collateralFactor: parseInt(taskArgs.cf),
      interestRateModel: sdk.chainDeployment.JumpRateModel.address,
      reserveFactor: 10,
      bypassPriceFeedCheck: true,
      feeDistributor: sdk.chainDeployment.FeeDistributor.address,
      symbol: taskArgs.symbol,
      name: taskArgs.name
    };

    const reserveFactorBN = ethers.utils.parseUnits((config.reserveFactor / 100).toString());
    const adminFeeBN = ethers.utils.parseUnits((config.adminFee / 100).toString());
    const collateralFactorBN = ethers.utils.parseUnits((config.collateralFactor / 100).toString());

    const deployArgs = [
      config.underlying,
      config.comptroller,
      config.feeDistributor,
      config.interestRateModel,
      config.name,
      config.symbol,
      reserveFactorBN,
      adminFeeBN
    ];
    console.log("deployArgs", deployArgs);
    console.log("collateralFactorBN", collateralFactorBN.toString());
    const constructorData = abiCoder.encode(
      ["address", "address", "address", "address", "string", "string", "uint256", "uint256"],
      deployArgs
    );

    if (chainId == 34443 && comptroller.address === "0xFB3323E24743Caf4ADD0fDCCFB268565c0685556") {
      // const gnosisContractAddress = "0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2";
      const populatedTx = await comptroller.populateTransaction._deployMarket(
        delegateType,
        constructorData,
        implementationData,
        collateralFactorBN
      );

      console.log(populatedTx);
    } else {
      // Test Transaction
      const errorCode = await comptroller.callStatic._deployMarket(
        delegateType,
        constructorData,
        implementationData,
        collateralFactorBN
      );
      if (errorCode.toNumber() !== 0) {
        throw `Unable to _deployMarket: ${sdk.COMPTROLLER_ERROR_CODES[errorCode.toNumber()]}`;
      }
      // Make actual Transaction
      const tx = await comptroller._deployMarket(delegateType, constructorData, implementationData, collateralFactorBN);
      console.log("tx", tx.hash, tx.nonce);

      // Recreate Address of Deployed Market
      const receipt = await tx.wait();
      if (receipt.status != ethers.constants.One.toNumber()) {
        throw `Failed to deploy market for ${config.underlying}`;
      }
    }
  });
