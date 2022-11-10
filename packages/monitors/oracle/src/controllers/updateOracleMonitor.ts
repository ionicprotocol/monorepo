import { getSupabaseClient } from "../config";
import { baseConfig } from "../config/variables";
import { SupportedAssetPriceFeed } from "../types";

const updateOracleMonitorData = async (assets: SupportedAssetPriceFeed[]) => {
  const supabase = getSupabaseClient();
  for (const asset of assets) {
    try {
      const { error } = await supabase.from(baseConfig.supabaseOracleMonitorTableName).insert([
        {
          underlyingAddress: asset.asset.underlying.toLowerCase(),
          oracle: asset.asset.oracle,
          feedValid: asset.feedValidity == null ? true : false,
          chain: baseConfig.chainId,
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
