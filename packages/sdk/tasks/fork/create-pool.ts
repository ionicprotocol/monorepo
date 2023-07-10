import { task } from "hardhat/config";

task("fork:create-pool", "Create pool on forking node").setAction(async (taskArgs, hre) => {
  const deployer = await hre.ethers.getNamedSigner("deployer");
  const ionicSdkModule = await import("../ionicSdk");
  const sdk = await ionicSdkModule.getOrCreateIonic(deployer);

  console.log("Creating pool...");

  const poolAddress = await hre.run("pool:create", {
    name: "FORK:Testing Pool",
    creator: "deployer",
    priceOracle: sdk.chainDeployment.MasterPriceOracle.address,
    closeFactor: "50",
    liquidationIncentive: "8",
    enforceWhitelist: "false",
  });

  console.log("Pool created!");

  console.log("Adding assets...");

  const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
  const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
  const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
  const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";

  for (const underlying of [USDC, BTCB, ETH, BUSD]) {
    await hre.run("market:create", {
      comptroller: poolAddress,
      underlying,
      signer: "deployer",
    });
  }

  console.log("Added assets!");
});
