import { SupportedAssetPriceFeed } from "..";
import { config, supabase } from "../config";

const updateOracleMonitorData = async (asset: SupportedAssetPriceFeed) => {
  try {
    try {
      const { error } = await supabase.from(config.supabaseOracleMonitorTableName).insert([
        {
          underlyingAddress: asset.asset.underlying.toLowerCase(),
          oracle: asset.asset.oracle,
          valid: asset.valid,
          invalidReason: asset.invalidReason ? asset.invalidReason : null,
          extraInfo: asset.extraInfo ? asset.extraInfo : null,
          chain: config.chainId,
          priceBN: asset.priceBN.toString(),
          priceEther: asset.priceEther,
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
  } catch (err) {
    console.log(err);
  }
};

export default updateOracleMonitorData;
