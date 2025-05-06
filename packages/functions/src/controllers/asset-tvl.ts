import { NativePricedIonicAsset, SupportedChains } from '@ionicprotocol/types';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { IonicSdk, erc20Abi, filterOnlyObjectProperties } from '@ionicprotocol/sdk';
import { Handler } from '@netlify/functions';
import { chainIdtoChain, chainIdToConfig } from '@ionicprotocol/chains';
import axios from 'axios';
import { Chain, createPublicClient, formatUnits, formatEther, http } from 'viem';

export const HEARTBEAT_API_URL = environment.uptimeTvlApi;

// Utility function to retry operations
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    if (retries === 0) throw e;
    console.log(`Retry attempt ${3-retries+1}/3 after ${delay}ms delay`);
    await new Promise(r => setTimeout(r, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};

// Define excluded comptrollers
const EXCLUDED_COMPTROLLERS = [
  '0xfb3323e24743caf4add0fdccfb268565c0685556', // Mode Main market
].map(address => address.toLowerCase());

export const updateAssetTvl = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    let publicClient;
    
    // Special handling for Base chain with custom RPCs
    if (chainId === SupportedChains.base) {
      // Parse comma-separated list of Base RPC URLs from environment variable
      const customBaseRpcUrls = environment.baseRpcUrl
        .split(',')
        .map(url => url.trim())
        .filter(Boolean);
      
      if (customBaseRpcUrls.length > 0) {
        for (const rpcUrl of customBaseRpcUrls) {
          try {
            publicClient = createPublicClient({
              chain: chainIdtoChain[chainId] as Chain,
              transport: http(rpcUrl, {
                timeout: 60000,
                retryCount: 5,
                retryDelay: 2000,
              }),
            });
            await publicClient.getBlockNumber();
            console.log(`Connected to Base custom RPC #${customBaseRpcUrls.indexOf(rpcUrl) + 1}`);
            break;
          } catch (e) {
            console.log(`Failed to connect to Base custom RPC #${customBaseRpcUrls.indexOf(rpcUrl) + 1}, trying next...`);
            continue;
          }
        }
      }
      
      // If all custom RPCs failed or weren't provided, fall back to default RPCs
      if (!publicClient) {
        const defaultRpcUrls = config.specificParams.metadata.rpcUrls.default.http;
        for (const rpcUrl of defaultRpcUrls) {
          try {
            publicClient = createPublicClient({
              chain: chainIdtoChain[chainId] as Chain,
              transport: http(rpcUrl, {
                timeout: 60000,
                retryCount: 5,
                retryDelay: 2000,
              }),
            });
            await publicClient.getBlockNumber();
            console.log(`Connected to Base default RPC: ${rpcUrl}`);
            break;
          } catch (e) {
            console.log(`Failed to connect to Base default RPC ${rpcUrl}, trying next...`);
            continue;
          }
        }
      }
    } else {
      // For other chains, use default RPCs with retry mechanism
      const rpcUrls = config.specificParams.metadata.rpcUrls.default.http;
      
      for (const rpcUrl of rpcUrls) {
        try {
          publicClient = createPublicClient({
            chain: chainIdtoChain[chainId] as Chain,
            transport: http(rpcUrl, {
              timeout: 60000,
              retryCount: 3,
              retryDelay: 1500,
            }),
          });
          await publicClient.getBlockNumber();
          console.log(`Connected to ${chainIdtoChain[chainId].name} RPC: ${rpcUrl}`);
          break;
        } catch (e) {
          console.log(`Failed to connect to ${chainIdtoChain[chainId].name} RPC ${rpcUrl}, trying next...`);
          continue;
        }
      }
    }

    if (!publicClient) {
      throw new Error(`All RPC endpoints failed for ${chainIdtoChain[chainId].name}`);
    }
    
    const sdk = new IonicSdk(publicClient as any, undefined, config);

    const [poolIndexes, pools] = await withRetry(() => {
      return sdk.contracts.PoolDirectory.read.getActivePools();
    });

    if (!pools.length || !poolIndexes.length) {
      throw new Error(`Error: Pools not found`);
    }

    const totalAssets: NativePricedIonicAsset[] = [];
    const results: {
      cTokenAddress: string;
      underlyingAddress: string;
      tvlUnderlying: string;
      tvlNative: string;
      totalMarketBorrow: string
      borrowtotal: string
    }[] = [];

    await Promise.all(
      pools.map(async ({ comptroller }) => {
        const assets: NativePricedIonicAsset[] = (
          await withRetry(() => {
            return sdk.contracts.PoolLens.simulate
              .getPoolAssetsWithData([comptroller])
              .then((r) => r.result)
              .catch(() => []);
          })
        ).map(filterOnlyObjectProperties);

        // Filter out excluded markets
        const filteredAssets = assets.filter(asset => 
          !EXCLUDED_COMPTROLLERS.includes(comptroller.toLowerCase())
        );

        totalAssets.push(...filteredAssets);
        console.log("assets", totalAssets);
      })
    );

    await Promise.all(
      totalAssets.map(async (asset) => {
        try {
          const cTokenContract = sdk.createICErc20(asset.cToken);
          const tvlUnderlyingBig = await withRetry(() => {
            return cTokenContract.read.getTotalUnderlyingSupplied();
          });
          const formattedTokenAddress = `0x${asset.underlyingToken.replace(/^0x/, "")}` as `0x${string}`;

          // Fetch the token decimals
          const tokenDecimals = await withRetry(() => {
            return publicClient.readContract({
              address: formattedTokenAddress,
              abi: erc20Abi,
              functionName: "decimals",
            });
          }) as number;
          
          // Adjust the formatting based on token decimals
          const tvlUnderlying = formatUnits(tvlUnderlyingBig, tokenDecimals);
          const underlyingPrice = Number(formatEther(asset.underlyingPrice));
          const tvlNative = (parseFloat(tvlUnderlying) * underlyingPrice).toFixed(8);
          const totalMarketBorrow = formatUnits(asset.totalBorrow, tokenDecimals);
          const borrowtotal = (parseFloat(totalMarketBorrow) * underlyingPrice).toFixed(8);
          

          results.push({
            cTokenAddress: asset.cToken,
            underlyingAddress: asset.underlyingToken,
            tvlUnderlying,
            tvlNative,
            totalMarketBorrow,
            borrowtotal
          });
          // console.log("result",results)
        } catch (exception) {
          console.error(`Error processing asset ${asset.cToken}:`, exception);
          await functionsAlert(
            `Functions.asset-tvl: CToken '${asset.cToken}' / Chain '${chainId}'`,
            JSON.stringify(exception)
          );
        }
      })
    );

    // Insert TVL data into the database
    const rows = results.map((r) => ({
      chain_id: chainId,
      ctoken_address: r.cTokenAddress.toLowerCase(),
      underlying_address: r.underlyingAddress.toLowerCase(),
      info: {
        tvlUnderlying: r.tvlUnderlying,
        tvlNative: r.tvlNative,
        createdAt: new Date().getTime(),
      },
    }));

    await axios.get(HEARTBEAT_API_URL);
    const { error } = await supabase.from(environment.supabaseAssetTvlTableName).insert(rows);

    if (error) {
      throw new Error(`Error saving asset TVL to database: ${error.message}`);
    }

    return { results, totalAssets }; // Return both arrays
  } catch (err) {
    console.error('Error in updateAssetTvl:', err);
    await functionsAlert('Functions.asset-tvl: Generic Error', JSON.stringify(err));
    return { results: [], totalAssets: [] }; // Return empty arrays with correct structure
  }
};


export const createAssetTvlHandler =
  (chain: SupportedChains): Handler =>
  async () => {
    try {
      await updateAssetTvl(chain);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'done' }),
      };
    } catch (err) {
      console.error('Error in createAssetTvlHandler:', err);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: err }),
      };
    }
  };

export default createAssetTvlHandler;
