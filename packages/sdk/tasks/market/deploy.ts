import { MarketConfig } from "@ionicprotocol/types";
import { task, types } from "hardhat/config";

task("market:deploy", "deploy market")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("cf", "Collateral factor", "80", types.string)
  .addParam("underlying", "Collateral factor", "80", types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
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
      adminFee: 0,
      collateralFactor: parseInt(taskArgs.cf),
      interestRateModel: sdk.chainDeployment.JumpRateModel.address,
      reserveFactor: 0,
      bypassPriceFeedCheck: true,
      feeDistributor: sdk.chainDeployment.FeeDistributor.address,
      symbol: "fUSDR-1",
      name: "Pearl Farm USDR"
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
      throw "Failed to deploy market ";
    }
  });
