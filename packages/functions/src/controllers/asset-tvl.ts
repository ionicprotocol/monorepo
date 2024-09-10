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
      throw new Error(`Error: Pools not found`);
    }

    const totalAssets: NativePricedIonicAsset[] = [];
    const results: {
      cTokenAddress: string;
      underlyingAddress: string;
      tvlUnderlying: string;
      tvlNative: string;
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
      })
    );

    await Promise.all(
      totalAssets.map(async (asset) => {
        try {
          const cTokenContract = sdk.createICErc20(asset.cToken);
          const tvlUnderlyingBig = await cTokenContract.read.getTotalUnderlyingSupplied();
          const tvlUnderlying = formatUnits(tvlUnderlyingBig, 18);
          const underlyingPrice = Number(formatEther(asset.underlyingPrice));
          const tvlNative = (parseFloat(tvlUnderlying) * underlyingPrice).toFixed(2);

          results.push({
            cTokenAddress: asset.cToken,
            underlyingAddress: asset.underlyingToken,
            tvlUnderlying,
            tvlNative,
          });
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

    return results; // Return the results array
  } catch (err) {
    console.error('Error in updateAssetTvl:', err);
    await functionsAlert('Functions.asset-tvl: Generic Error', JSON.stringify(err));
    return []; // Return an empty array in case of error
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
