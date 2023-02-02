import { parseUnits } from "ethers/lib/utils";
import { task } from "hardhat/config";

task("fork:create-pool", "Create pool on forking node").setAction(async (taskArgs, hre) => {
  // @ts-ignore
  const midasSdkModule = await import("../../tests/utils/midasSdk");
  // @ts-ignore
  const assetModule = await import("../../tests/utils/assets");

  const signer = await hre.ethers.getNamedSigner("deployer");
  const sdk = await midasSdkModule.getOrCreateMidas(signer);

  console.log("Creating pool...");

  const [poolAddress] = await sdk.deployPool(
    "FORK:Testing Pool",
    false,
    parseUnits("0.5"),
    parseUnits((8 / 100 + 1).toString()),
    "0x429041250873643235cb3788871447c6fF3205aA",
    []
  );

  console.log("Pool created!");

  console.log("Adding assets...");

  const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
  const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
  const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
  const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";

  const assets = await assetModule.getAssetsConf(
    poolAddress,
    sdk.contracts.FuseFeeDistributor.address,
    sdk.chainDeployment.JumpRateModel.address,
    hre.ethers
  );

  const assetConfigs = [USDC, BTCB, ETH, BUSD].map((underlying) => {
    const assetConfig = assets.find((a) => a.underlying === underlying);

    if (!assetConfig) {
      throw `No asset config found for ${underlying}`;
    }

    return assetConfig;
  });

  await Promise.all(assetConfigs.map(async (config) => await sdk.deployAsset(config)));

  console.log("Added assets!");
});
