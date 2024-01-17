import { assetFilter, assetSymbols, MarketConfig, underlying } from "@ionicprotocol/types";
import { task, types } from "hardhat/config";

import { assets as modeAssets } from "../../../chains/src/mode/assets";

task("markets:deploy:mode", "deploy mode markets").setAction(async (taskArgs, { run }) => {
  const symbols = [
    // assetSymbols.WETH,
    // assetSymbols.USDC,
    // assetSymbols.USDT,
    assetSymbols.DAI,
    assetSymbols.LINK,
    assetSymbols.BAL,
    assetSymbols.SNX,
    assetSymbols.UNI,
    assetSymbols.WBTC,
    assetSymbols.AAVE
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

task("market:deploy", "deploy market")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("cf", "Collateral factor", "80", types.string)
  .addParam("underlying", "Asset token address", undefined, types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("symbol", "CToken symbol", undefined, types.string)
  .addParam("name", "CToken name", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
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
  });
