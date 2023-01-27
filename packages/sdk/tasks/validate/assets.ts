import { chainIdToConfig } from "@midas-capital/chains";
import { SupportedAsset } from "@midas-capital/types";
import { task } from "hardhat/config";

function difference(a: Set<any>, b: Set<any>): Set<any> {
  const _difference = new Set<any>(a);
  for (const elem of b) {
    _difference.delete(elem);
  }
  return _difference;
}

export default task("validate:assets", "Get pools data").setAction(async (taskArgs, hre) => {
  // @ts-ignore
  const midasSdkModule = await import("../../tests/utils/midasSdk");
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  const chainAssets: Set<SupportedAsset> = new Set<SupportedAsset>(
    chainIdToConfig[chainId].assets.filter((x) => x.disabled == false || x.disabled == undefined)
  );

  const chainRedemptionStrategies = chainIdToConfig[chainId].redemptionStrategies;

  const sdk = await midasSdkModule.getOrCreateMidas();

  const liveAssets = await sdk.getLiveAssets();
  const underlingLiveAssets = new Set<string>(Array.from(liveAssets).map((x) => x.underlying));

  const nonLiveAssets = difference(chainAssets, liveAssets);

  sdk.logger.info(`Found ${nonLiveAssets.size} non-live assets, consider marking them as disabled: `);
  Array.from(nonLiveAssets).map((a) => {
    sdk.logger.info(` - ${a.underlying} (${a.symbol})`);
  });

  const customRedemptionStrategies = new Set<string>(Object.keys(chainRedemptionStrategies));
  const defaultRedemptionStrategies = difference(underlingLiveAssets, customRedemptionStrategies);

  sdk.logger.info(`Found ${defaultRedemptionStrategies.size} assets using default redemption strategies: `);
  Array.from(defaultRedemptionStrategies).map((a) => {
    const asset = chainIdToConfig[chainId].assets.find((x) => x.underlying === a);
    if (!asset) {
      throw new Error(`Asset not found for ${a}, this should never happen`);
    }
    sdk.logger.info(` - ${asset.underlying} (${asset?.symbol})`);
  });
});
