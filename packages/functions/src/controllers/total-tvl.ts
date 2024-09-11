import { SupportedChains } from '@ionicprotocol/types';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { updateAssetTvl } from './asset-tvl';
import axios from 'axios'; // Assuming axios is already installed for API requests
import { Handler } from '@netlify/functions';

// Function to get ETH to USD conversion rate from Coingecko API
const getEthToUsdRate = async (): Promise<number> => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    return response.data.ethereum.usd;
  } catch (error) {
    console.error('Error fetching ETH to USD rate:', error);
    throw new Error('Unable to fetch ETH to USD conversion rate');
  }
};

// Function to calculate and store total TVL per chain
export const updateTotalTvl = async (chainId: SupportedChains): Promise<void> => {
  try {
    // Call updateAssetTvl to get the TVL for each asset
    const results = await updateAssetTvl(chainId);

    // Log each asset's TVL
    results.forEach((asset: { tvlNative: string }) => {
      // console.log(`Asset TVL (native): ${asset.tvlNative}`);
    });

    // Summing up the total TVL (native) in ETH
    const totalTvlNative = results.reduce((total: number, asset: { tvlNative: string }) => {
      return total + parseFloat(asset.tvlNative);
    }, 0);

    // Log the total TVL in native ETH
    // console.log(`Total TVL (native ETH): ${totalTvlNative}`);

    // Fetch ETH to USD conversion rate
    const ethToUsdRate = await getEthToUsdRate();
    // console.log(`ETH to USD rate: ${ethToUsdRate}`);

    // Convert total TVL from ETH to USD
    const totalTvlUsd = totalTvlNative * ethToUsdRate;
    // console.log(`Total TVL (USD): ${totalTvlUsd}`);

    // Create row for the total TVL data
    const totalTvlRow = {
      chain_id: chainId,
      total_tvl_native: totalTvlNative.toFixed(18), // Storing as string for fixed precision
      total_tvl_usd: totalTvlUsd.toFixed(2), // Store the USD equivalent
    };

    // Insert the total TVL row into the database
    const { error } = await supabase
      .from(environment.supabaseAssettotalTvlTableName) // New table name for total TVL
      .insert([totalTvlRow]);

    if (error) {
      throw new Error(`Error occurred during saving total TVL to database: ${error.message}`);
    }
  } catch (err) {
    console.error('Error in updateTotalTvl:', err);
    await functionsAlert('Functions.total-tvl: Generic Error', JSON.stringify(err));
  }
};


// Create a Netlify function handler for calculating the total TVL
export const createTotalTvlHandler =
  (chain: SupportedChains): Handler =>
  async (event) => {
    try {
      await updateTotalTvl(chain);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Total TVL calculation done' }),
      };
    } catch (err: any) {
      console.error('Error in createTotalTvlHandler:', err);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: err.message }),
      };
    }
  };

export default createTotalTvlHandler;
