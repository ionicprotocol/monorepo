import { assetFilter, assetSymbols, MarketConfig } from "@ionicprotocol/types";
import { task, types } from "hardhat/config";

import { assets as baseAssets } from "../../../chains/src/base/assets";
import { assets as modeAssets } from "../../../chains/src/mode/assets";

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

task("markets:deploy:base", "deploy base markets").setAction(async (taskArgs, { run }) => {
  const symbols = [
    { symbol: assetSymbols.AERO, cf: "65" },
    { symbol: assetSymbols.cbETH, cf: "80" },
    { symbol: assetSymbols.USDC, cf: "90" },
    { symbol: assetSymbols.wstETH, cf: "82.5" },
    { symbol: assetSymbols.ezETH, cf: "67.5" },
    { symbol: assetSymbols.WETH, cf: "82.5" }
  ];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const asset = assetFilter(baseAssets, symbol.symbol);
    await run("market:deploy", {
      signer: "deployer",
      cf: symbol.cf,
      underlying: asset.underlying,
      comptroller: "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13",
      symbol: "ion" + asset.symbol,
      name: `Ionic ${asset.name}`
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
