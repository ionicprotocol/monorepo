import { parseUnits } from "ethers/lib/utils";
import { task } from "hardhat/config";

task("fork:create-pool", "Create pool on forking node").setAction(async (taskArgs, hre) => {
  const signer = await hre.ethers.getNamedSigner("deployer");

  // @ts-ignore
  const midasSdkModule = await import("../../tests/utils/midasSdk");
  const sdk = await midasSdkModule.getOrCreateMidas(signer);

  await sdk.deployPool(
    "FORK:Testing Pool",
    false,
    parseUnits("0.5"),
    parseUnits((8 / 100 + 1).toString()),
    "0x429041250873643235cb3788871447c6fF3205aA",
    []
  );

  sdk.logger.info("Pool created!");
});
