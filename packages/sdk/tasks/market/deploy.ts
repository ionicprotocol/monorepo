import { task, types } from "hardhat/config";

task("market:deploy", "deploy market")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("cf", "Collateral factor", "800000000000000000", types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner(taskArgs.signer);
    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(signer);
    const comptroller = sdk.createComptroller(taskArgs.comptroller, signer);

    const constructorData =
      "0x000000000000000000000000216690738aac4aa0c4770253ca26a28f0115c5950000000000000000000000003c9c6471e2bdabf68c4908e65c14e45c9bfc951d000000000000000000000000f656d243a23a0987329ac6522292f4104a7388e100000000000000000000000079ebf6d2f3724254f290862a5a0f57044885cb50000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000096a9327aaf9f6dd5f83a644f1d0be367a05069e400000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002e4c69646f2073744d4154494320506f6f6c20204d61746963582d626261574d4154494320537461626c6520424c5000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000186653744d617469632de2808b626261574d415449432d3133000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000";

    const collateralFactor = ethers.BigNumber.from(taskArgs.cf);
    // Test Transaction
    const errorCode = await comptroller.callStatic._deployMarket(false, constructorData, collateralFactor);
    if (errorCode.toNumber() !== 0) {
      throw `Unable to _deployMarket: ${sdk.COMPTROLLER_ERROR_CODES[errorCode.toNumber()]}`;
    }
    // Make actual Transaction
    const tx = await comptroller._deployMarket(false, constructorData, collateralFactor, {
      // suggested: 394700457
      // max:         7920027
      gasLimit: 20020027,
      maxFeePerGas: ethers.utils.parseUnits("240", "gwei"),
      maxPriorityFeePerGas: ethers.utils.parseUnits("50", "gwei")
    });
    console.log("tx", tx.hash, tx.nonce);

    // Recreate Address of Deployed Market
    const receipt = await tx.wait();
    if (receipt.status != ethers.constants.One.toNumber()) {
      throw "Failed to deploy market ";
    }
  });
