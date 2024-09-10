import { SupportedChains } from '@ionicprotocol/types';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { updateAssetTvl } from './asset-tvl'; 
import { Handler } from '@netlify/functions';

// Function to calculate and store total TVL per chain
export const updateTotalTvl = async (chainId: SupportedChains) => {
  try {
    // Call updateAssetTvl to get the TVL for each asset
    const results = await updateAssetTvl(chainId);

    // Summing up the total TVL (native) 
    const totalTvlNative = results.reduce((total: number, asset: { tvlNative: string; }) => {
      return total + parseFloat(asset.tvlNative);
    }, 0);
     //underlying
    const totaltvlUnderlying = results.reduce((total: number, asset: { tvlUnderlying: string; }) => {
        return total + parseFloat(asset.tvlUnderlying);
      }, 0);
    
    // Create row for the total TVL data
    const totalTvlRow = {
      chain_id: chainId,
      total_tvl_native: totalTvlNative.toFixed(2), // Storing as string for fixed precision
      total_tvl_Underlying: totaltvlUnderlying.toFixed(2),
    //   created_at: new Date().getTime(),
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
    } catch (err : any) {
      console.error('Error in createTotalTvlHandler:', err );
      return {
        statusCode: 500,
        body: JSON.stringify({ message: err.message }),
      };
    }
  };

export default createTotalTvlHandler;
