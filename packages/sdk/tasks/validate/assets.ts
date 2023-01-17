import { chainIdToConfig } from "@midas-capital/chains";
import { SupportedAsset } from "@midas-capital/types";
import { task } from "hardhat/config";

import { FusePoolDirectory } from "../../typechain/FusePoolDirectory";
import { FusePoolLens } from "../../typechain/FusePoolLens";

export default task("validate:assets", "Get pools data").setAction(async (taskArgs, hre) => {
  // @ts-ignore
  const midasSdkModule = await import("../../tests/utils/midasSdk");
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  const chainAssets: SupportedAsset[] = chainIdToConfig[chainId].assets.filter(
    (x) => x.disabled == false || x.disabled == undefined
  );

  const sdk = await midasSdkModule.getOrCreateMidas();
  const signer = await hre.ethers.getNamedSigner("deployer");

  const fpl = (await hre.ethers.getContract("FusePoolLens", signer)) as FusePoolLens;
  const fpd = (await hre.ethers.getContract("FusePoolDirectory", signer)) as FusePoolDirectory;
  const pools: FusePoolDirectory.FusePoolStruct[] = await fpd.callStatic.getAllPools();

  const allAssets = new Set<string>();
  for (const pool of pools) {
    // const comptroller = sdk.createComptroller(await pool.comptroller, signer);
    const [, , ulTokens, ulSymbols] = await fpl.callStatic.getPoolSummary(pool.comptroller);
    console.log(`Pool: ${pool.name} (${pool.comptroller})`);
    console.log(`Assets: ${ulTokens.length}`);
    for (const [idx, token] of ulTokens.entries()) {
      console.log(`- ${token} (${ulSymbols[idx]})`);
      allAssets.add(token);
    }
  }
  for (const asset of chainAssets) {
    if (!allAssets.has(asset.underlying)) {
      console.log(`Missing asset: ${asset.symbol} (${asset.underlying})`);
    }
  }
});
