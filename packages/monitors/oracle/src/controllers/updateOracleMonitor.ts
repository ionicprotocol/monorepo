import { SupportedAssetPriceFeed } from "..";
import { config, supabase } from "../config";

const updateOracleMonitorData = async (assets: SupportedAssetPriceFeed[]) => {
  for (const asset of assets) {
    try {
      const { error } = await supabase.from(config.supabaseOracleMonitorTableName).insert([
        {
          underlyingAddress: asset.asset.underlying.toLowerCase(),
          oracle: asset.asset.oracle,
          priceValid: asset.priceValidity == null ? true : false,
          feedValid: asset.feedValidity == null ? true : false,
          priceInvalidReason: asset.priceValidity ? asset.priceValidity.invalidReason : null,
          priceInvalidMsg: asset.priceValidity ? asset.priceValidity.invalidReason : null,
          feedInvalidReason: asset.feedValidity ? asset.feedValidity.invalidReason : null,
          chain: config.chainId,
          priceBN: asset.mpoPrice,
        },
      ]);
      if (error) {
        console.log(`Error occurred during saving data for asset ${asset.asset.underlying}: ${error.message}`);
      } else {
        console.log(`Successfully saved data for asset ${asset.asset.underlying}`);
      }
    } catch (err) {
      console.log(err);
    }
  }
};

export default updateOracleMonitorData;
