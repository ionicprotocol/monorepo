import { task, types } from "hardhat/config";

export default task("get-liquidations", "Get potential liquidations")
  .addOptionalParam(
    "comptrollers",
    "Supported comptrollers for which to search for liquidations",
    undefined,
    types.string
  )
  .addOptionalParam("maxHealth", "Filter pools by max health", "1", types.string)
  .setAction(async (taskArgs, hre) => {
    // @ts-ignore
    const fuseModule = await import("../tests/utils/fuseSdk");
    const sdk = await fuseModule.getOrCreateFuse();
    const wallet = hre.ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
    const liquidations = await sdk.getPotentialLiquidations(
      wallet,
      [],
      hre.ethers.utils.parseEther(taskArgs.maxHealth)
    );
    liquidations.map((l) => {
      console.log(`Found ${l.liquidations.length} liquidations for pool: ${l.comptroller}}`);
      l.liquidations.map((tx, i) => {
        console.log(`\n #${i}: method: ${tx.method}, args: ${tx.args}, value: ${tx.value}`);
      });
    });
  });
