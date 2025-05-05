import { NativePricedIonicAsset, SupportedChains } from '@ionicprotocol/types';
import { filterOnlyObjectProperties, IonicSdk } from '@ionicprotocol/sdk';
import { Handler } from '@netlify/functions';
import { chainIdToConfig, chainIdtoChain } from '@ionicprotocol/chains';
import axios from 'axios';
import {
  Chain,
  createPublicClient,
  formatEther,
  http,
  getContract,
} from 'viem';

import { environment, supabase } from '../config';
import { functionsAlert } from '../alert';
import CTokenABI from '../abi/CToken.json';

export const HEARTBEAT_API_URL = environment.uptimeAssetPriceApi || '';
export const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=';
export const DEFI_LLAMA_API = 'https://coins.llama.fi/prices/current/';

export const updateAssetPriceAndRates = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    console.log(`Processing chain ${chainId} with ${config.assets.length} assets`);
    
    const publicClient = createPublicClient({
      chain: chainIdtoChain[chainId] as Chain,
      transport: http(config.specificParams.metadata.rpcUrls.default.http[0]),
    });
    
    try {
      const sdk = new IonicSdk(publicClient as any, undefined, config);
      console.log("SDK initialized");

      const mpo = sdk.createMasterPriceOracle();
      console.log("Master Price Oracle created");

      // Get pools and assets first
      console.log("Fetching pools...");
      const [poolIndexes, pools] = await sdk.contracts.PoolDirectory.read.getActivePools();
      console.log(`Found ${pools.length} pools`);
      
      if (!pools.length || !poolIndexes.length) {
        throw new Error(`Error: Pools not found`);
      }

      const totalAssets: NativePricedIonicAsset[] = [];
      
      console.log("Fetching assets from pools...");
      await Promise.all(
        pools.map(async ({ comptroller }) => {
          try {
            console.log(`Fetching assets for comptroller ${comptroller}`);
            const assets: NativePricedIonicAsset[] = (
              await sdk.contracts.PoolLens.simulate
                .getPoolAssetsWithData([comptroller])
                .then((r) => {
                  console.log(`Got ${r.result.length} assets from pool`);
                  return r.result;
                })
                .catch((e) => {
                  console.error(`Error fetching pool assets: ${e}`);
                  return [];
                })
            ).map(filterOnlyObjectProperties);

            totalAssets.push(...assets);
          } catch (e) {
            console.error(`Error processing comptroller ${comptroller}: ${e}`);
          }
        })
      );

      console.log(`Found ${totalAssets.length} total assets in pools`);
      
      // Get USD price
      const cgId = config.specificParams.cgId;
      let price = 0;
      try {
        const { data } = await axios.get(`${COINGECKO_API}${cgId}`);
        if (data[cgId] && data[cgId].usd) {
          price = Number(data[cgId].usd);
        }
      } catch (e) {
        const { data } = await axios.get(`${DEFI_LLAMA_API}coingecko:${cgId}`);
        if (data.coins[`coingecko:${cgId}`] && data.coins[`coingecko:${cgId}`].price) {
          price = Number(data.coins[`coingecko:${cgId}`].price);
        }
      }

      console.log(`Native token price: ${price}`);

      const results = await Promise.all(
        totalAssets.map(async (asset) => {
          try {
            // Get underlying price
            const underlyingPrice = await mpo.read.price([asset.underlyingToken]);
            const underlyingPriceNum = Number(formatEther(underlyingPrice));
            const usdPrice = underlyingPriceNum * price;

            console.log(`Asset ${asset.underlyingSymbol}: underlying price = ${underlyingPriceNum}, USD price = ${usdPrice}`);

            let exchangeRateNum = 0;
            const cTokenContract = getContract({
              address: asset.cToken as `0x${string}`,
              abi: CTokenABI,
              client: publicClient
            });

            try {
              const exchangeRate = await cTokenContract.read.exchangeRateCurrent();
              exchangeRateNum = Number(formatEther(exchangeRate as bigint));
              
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
              console.error(`Error getting exchange rate for ${asset.underlyingSymbol}:`, err);
              try {
                const exchangeRate = await cTokenContract.read.exchangeRateStored();
                exchangeRateNum = Number(formatEther(exchangeRate as bigint));
              } catch (fallbackErr) {
                console.error(`Fallback also failed for ${asset.underlyingSymbol}:`, fallbackErr);
                return null;
              }
            }

            return {
              chainId,
              underlyingAddress: asset.underlyingToken,
              cTokenAddress: asset.cToken,
              underlyingPriceNum,
              usdPrice,
              exchangeRate: exchangeRateNum,
            };
          } catch (exception) {
            console.error(`Error processing asset ${asset.underlyingSymbol}:`, exception);
            await functionsAlert(
              `Functions.asset-price-and-rates: Asset '${asset.underlyingSymbol}(${asset.underlyingToken})' / Chain '${chainId}'`,
              JSON.stringify(exception)
            );
            return null;
          }
        }),
      );

      console.log(`Processed ${results.filter(r => !!r).length} assets successfully`);
      
      const rows = results
        .filter((r) => !!r)
        .map((r) => ({
          chain_id: chainId,
          underlying_address: r?.underlyingAddress.toLowerCase(),
          ctoken_address: r?.cTokenAddress.toLowerCase(),
          info: {
            underlyingPrice: r?.underlyingPriceNum,
            usdPrice: r?.usdPrice,
            exchangeRate: r?.exchangeRate,
            createdAt: new Date().getTime(),
          },
        }));

      console.log(`Inserting ${rows.length} rows into database`);

      // Only call heartbeat if URL is configured
      if (HEARTBEAT_API_URL) {
        try {
          await axios.get(HEARTBEAT_API_URL);
        } catch (err) {
          console.error("Error calling heartbeat API:", err);
        }
      }

      const { error } = await supabase.from(environment.supabaseAssetPriceAndRatesTableName).insert(rows);

      if (error) {
        throw `Error occurred during saving asset prices and rates to database: ${error.message}`;
      }
    } catch (e) {
      console.error("Error in SDK operations:", e);
      throw e;
    }

  } catch (err) {
    console.error("Top level error:", err);
    await functionsAlert('Functions.asset-price-and-rates: Generic Error', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    throw err; // Re-throw to ensure proper error response
  }
};

export const createAssetPriceAndRatesHandler =
  (chain: SupportedChains): Handler =>
  async () => {
    try {
      await updateAssetPriceAndRates(chain);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'done' }),
      };
    } catch (err) {
      console.error('Handler error:', err);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        }),
      };
    }
  };

export default createAssetPriceAndRatesHandler; 