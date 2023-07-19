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

    const constructorData = "";
    const becomeImplData = "";

    const collateralFactor = ethers.BigNumber.from(taskArgs.cf);
    // Test Transaction
    const errorCode = await comptroller.callStatic._deployMarket(1, constructorData, becomeImplData, collateralFactor);
    if (errorCode.toNumber() !== 0) {
      throw `Unable to _deployMarket: ${sdk.COMPTROLLER_ERROR_CODES[errorCode.toNumber()]}`;
    }
    // Make actual Transaction
    const tx = await comptroller._deployMarket(1, constructorData, becomeImplData, collateralFactor, {
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
