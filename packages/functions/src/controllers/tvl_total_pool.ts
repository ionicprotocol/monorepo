import { SupportedChains } from '@ionicprotocol/types';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { updateAssetTvl } from './asset-tvl';
import axios from 'axios';
import { Handler } from '@netlify/functions';

export const HEARTBEAT_API_URL = environment.uptimeTvlTotalPoolApi;
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

export const updateTotalTvl = async (chainId: SupportedChains): Promise<void> => {
  try {
    console.log('Starting updateTotalTvl for chain:', chainId);
    
    const { results, totalAssets } = await updateAssetTvl(chainId);
    
    if (!results || !results.length) {
      console.log(`No assets found for chain ${chainId}`);
      return;
    }

    console.log('Got assets, count:', results.length);
    const ethToUsdRate = await getEthToUsdRate();
    console.log('ETH/USD rate:', ethToUsdRate);

    // Calculate totals per pool
    const poolTotals = results.reduce((acc: { [key: string]: any }, asset: any) => {
      const poolAddress = asset.cTokenAddress;
      if (!poolAddress) {
        console.log('Missing pool address for asset:', asset);
        return acc;
      }

      // Get token info from totalAssets array
      const tokenInfo = totalAssets.find((a: { cToken: string }) => a.cToken === poolAddress);
      
      if (!acc[poolAddress]) {
        acc[poolAddress] = {
          total_tvl_native: 0,
          total_borrow_native: 0,
          underlying_name: tokenInfo?.underlyingName || 'Unknown',
          underlying_symbol: tokenInfo?.underlyingSymbol || 'UNKNOWN'
        };

        console.log('Token info:', {
          name: tokenInfo?.underlyingName,
          symbol: tokenInfo?.underlyingSymbol,
          poolAddress
        });
      }

      acc[poolAddress].total_tvl_native += parseFloat(asset.tvlNative || '0');
      acc[poolAddress].total_borrow_native += parseFloat(asset.borrowtotal || '0');
      
      return acc;
    }, {});

    console.log('Pool totals:', JSON.stringify(poolTotals, null, 2));

    const insertData = Object.entries(poolTotals).map(([poolAddress, totals]: [string, any]) => {
      console.log('Creating insert data for pool:', {
        poolAddress,
        underlying: {
          name: totals.underlying_name,
          symbol: totals.underlying_symbol
        }
      });

      return {
        pool_address: poolAddress,
        chain_id: chainId.toString(),
        underlying_name: totals.underlying_name || 'Unknown',
        underlying_symbol: totals.underlying_symbol || 'UNKNOWN',
        total_tvl_native: totals.total_tvl_native.toFixed(18),
        total_tvl_usd: (totals.total_tvl_native * ethToUsdRate).toFixed(2),
        total_borrow_usd: (totals.total_borrow_native * ethToUsdRate).toFixed(2),
        created_at: new Date().toISOString()
      };
    });

    console.log('Prepared insert data:', JSON.stringify(insertData, null, 2));

    try {
      // Simple insert instead of upsert
      await axios.get(HEARTBEAT_API_URL);
      const { error, data } = await supabase
        .from(environment.supabaseAssetTotalTvlPoolName)
        .insert(insertData);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully inserted TVL data');
    } catch (dbError: any) {
      console.error('Database operation failed:', dbError);
      throw dbError;
    }

  } catch (err) {
    console.error('Error in updateTotalTvl:', err);
    await functionsAlert('Functions.total-tvl: Generic Error', JSON.stringify(err));
    throw err;
  }
};

export const createTotalTvlPoolHandler = (chainId: SupportedChains): Handler => async (event) => {
  try {
    await updateTotalTvl(chainId);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Total TVL calculation completed' }),
    };
  } catch (err: any) {
    console.error('Error in createTotalTvlHandler:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};  

export default createTotalTvlPoolHandler;   