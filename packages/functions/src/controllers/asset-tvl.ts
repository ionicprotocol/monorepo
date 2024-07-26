import { NativePricedIonicAsset, SupportedChains } from '@ionicprotocol/types';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { IonicSdk, filterOnlyObjectProperties } from '@ionicprotocol/sdk';
import { Handler } from '@netlify/functions';
import { chainIdtoChain, chainIdToConfig } from '@ionicprotocol/chains';
import axios from 'axios';
import { Chain, createPublicClient, formatUnits, formatEther, http } from 'viem';

export const HEARTBEAT_API_URL = environment.uptimeTvlApi;

export const updateAssetTvl = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    const publicClient = createPublicClient({
      chain: chainIdtoChain[chainId] as Chain,
      transport: http(config.specificParams.metadata.rpcUrls.default.http[0]),
    });
    const sdk = new IonicSdk(publicClient as any, undefined, config);

    const [poolIndexes, pools] = await sdk.contracts.PoolDirectory.read.getActivePools();

    if (!pools.length || !poolIndexes.length) {
      throw new Error(`Error occurred during saving assets TVL to database: pools not found`);
    }

    const totalAssets: NativePricedIonicAsset[] = [];
    const results: {
      cTokenAddress: string;
      underlyingAddress: string;
      tvlUnderlying: string; // Store as string to maintain precision
      tvlNative: string; // Store as string to maintain precision
    }[] = [];

    await Promise.all(
      pools.map(async ({ comptroller }) => {
        const assets: NativePricedIonicAsset[] = (
          await sdk.contracts.PoolLens.simulate
            .getPoolAssetsWithData([comptroller])
            .then((r) => r.result)
            .catch(() => [])
        ).map(filterOnlyObjectProperties);

        totalAssets.push(...assets);
      }),
    );

    await Promise.all(
      totalAssets.map(async (asset) => {
        try {
          const cTokenContract = sdk.createICErc20(asset.cToken);
          
          // Fetch TVL values
          const tvlUnderlyingBig = await cTokenContract.read.getTotalUnderlyingSupplied();
          
          // Convert `tvlUnderlyingBig` to string formatted with 18 decimal places
          const tvlUnderlying = formatUnits(tvlUnderlyingBig, 18);

          // Convert `underlyingPrice` from `bigint` to `number`
          const underlyingPrice = Number(formatEther(asset.underlyingPrice)); 

          // Calculate TVL in native units
          const tvlNative = (parseFloat(tvlUnderlying) * underlyingPrice).toFixed(2); // Fixed precision

          results.push({
            cTokenAddress: asset.cToken,
            underlyingAddress: asset.underlyingToken,
            tvlUnderlying: tvlUnderlying, // Storing as string
            tvlNative: tvlNative, // Storing as string for consistency
          });
        } catch (exception) {
          console.error(`Error processing asset ${asset.cToken}:`, exception);
          await functionsAlert(
            `Functions.asset-tvl: CToken '${asset.cToken}' / Chain '${chainId}'`,
            JSON.stringify(exception),
          );
        }
      }),
    );

    const rows = results
      .filter((r) => !!r)
      .map((r) => ({
        chain_id: chainId,
        ctoken_address: r.cTokenAddress.toLowerCase(),
        underlying_address: r.underlyingAddress.toLowerCase(),
        info: {
          tvlUnderlying: r.tvlUnderlying, // Storing as string
          tvlNative: r.tvlNative, // Storing as string
          createdAt: new Date().getTime(),
        },
      }));

    await axios.get(HEARTBEAT_API_URL);

    const { error } = await supabase.from(environment.supabaseAssetTvlTableName).insert(rows);

    if (error) {
      throw new Error(`Error occurred during saving asset TVL to database: ${error.message}`);
    }
  } catch (err) {
    console.error('Error in updateAssetTvl:', err);
    await functionsAlert('Functions.asset-tvl: Generic Error', JSON.stringify(err));
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
