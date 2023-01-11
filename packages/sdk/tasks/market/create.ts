import { DelegateContractName } from "@midas-capital/types";
import { task, types } from "hardhat/config";

export default task("market:create", "Create Market")
  .addParam("comptroller", "Address of the pool", undefined, types.string)
  .addParam("underlying", "Underlying asset address", undefined, types.string)
  .addParam("signer", "Signer name", "deployer", types.string) // TODO if you want custom signer, we need to rework `getOrCreateMidas` to take the signer
  .addOptionalParam("implementation", "Address of the implementation to use", undefined, types.string)
  .addOptionalParam("strategyCode", "If using strategy, pass its code", undefined, types.string)
  .addOptionalParam("strategyAddress", "Override the strategy address", undefined, types.string)

  .setAction(async (taskArgs, hre) => {
    const { comptroller, underlying } = taskArgs;

    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
    // @ts-ignore
    const assetModule = await import("../../tests/utils/assets");

    const assets = await assetModule.getAssetsConf(
      comptroller,
      sdk.contracts.FuseFeeDistributor.address,
      sdk.chainDeployment.JumpRateModel.address,
      hre.ethers
    );

    const assetConfig = assets.find((a) => a.underlying === underlying);

    if (!assetConfig) {
      throw "No asset config found";
    }
    console.log("Asset config: ", { assetConfig });

    console.log(
      `Creating market for token ${assetConfig.underlying}, pool ${comptroller}, impl: ${DelegateContractName.CErc20Delegate}`
    );

    const [assetAddress, implementationAddress, receipt] = await sdk.deployAsset(assetConfig);

    console.log("CToken: ", assetAddress);
  });
