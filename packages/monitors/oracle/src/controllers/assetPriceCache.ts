import { getSupabaseClient } from "../config";
import { baseConfig } from "../config/variables";
import { logger } from "../logger";
import { AssetPriceCache } from "../types";

export const insertAssetPriceCacheData = async (
  asset: Omit<
    AssetPriceCache,
    "first_observation_ts" | "second_observation_ts" | "first_observation_deviation" | "second_observation_deviation"
  >,
) => {
  logger.info(`Inserting asset price cache data: ${JSON.stringify(asset)}`);
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase.from(baseConfig.supabaseOracleCircuitBreakerTableName).insert(asset);
    if (error) {
      logger.error(`Error occurred during saving data for asset ${asset.asset_address}: ${error.message}`);
    } else {
      logger.debug(`Successfully saved data for asset ${asset.asset_address}`);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const updateAssetPriceCacheData = async (asset: AssetPriceCache) => {
  logger.info(`Updating asset price cache data: ${JSON.stringify(asset)}`);
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase
      .from(baseConfig.supabaseOracleCircuitBreakerTableName)
      .update(asset)
      .eq("asset_address", asset.asset_address);
    if (error) {
      logger.error(`Error occurred during saving data for asset ${asset.asset_address}: ${error.message}`);
    } else {
      logger.debug(`Successfully saved data for asset ${asset.asset_address}`);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const getAssetPriceCacheData = async (asset_address: string): Promise<[AssetPriceCache | null, any]> => {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from(baseConfig.supabaseOracleCircuitBreakerTableName)
      .select()
      .eq("asset_address", asset_address);
    if (error) {
      logger.error(`Error occurred fetching data for asset ${asset_address}: ${error.message}`);
      return [null, error];
    } else {
      if (data.length === 0) {
        logger.debug(`No data found for asset ${asset_address}`);
        return [null, null];
      }
      // should never happen as asset_address is unique
      if (data.length > 1) {
        throw new Error(`More than one data found for asset ${asset_address}`);
      }
      logger.debug(`Successfully fetched data for asset: ${JSON.stringify(data)}`);
      return [data[0] as AssetPriceCache, null];
    }
  } catch (err) {
    logger.error(err);
    return [null, err];
  }
};
