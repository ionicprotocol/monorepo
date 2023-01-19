import { task, types } from "hardhat/config";

task("flywheel:debug", "Deploy static rewards flywheel for LM rewards")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .addParam("pool", "comptroller to which to add the flywheel", undefined, types.string)
  .addParam("user", "user for which to debug", undefined, types.string)
  .setAction(async ({ signer, pool, user }, { ethers, run }) => {
    const deployer = await ethers.getNamedSigner(signer);

    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(deployer);
    const assets = await sdk.createComptroller(pool).callStatic.getAllMarkets();
    console.log({ assets });

    const allRewards = await Promise.all(
      assets.map((assetAddress) => sdk.getFlywheelClaimableRewardsForAsset(pool, assetAddress, user))
    );
    console.log(
      JSON.stringify(
        allRewards.filter((p) => p.length > 0),
        null,
        2
      )
    );
  });
