import { NativePricedIonicAsset, SupportedChains } from '@ionicprotocol/types';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { IonicSdk, filterOnlyObjectProperties } from '@ionicprotocol/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Handler } from '@netlify/functions';
import { chainIdtoChain, chainIdToConfig } from '@ionicprotocol/chains';
import { utils } from 'ethers';
import axios from 'axios';
import { createPublicClient, http } from 'viem';

export const HEARTBEAT_API_URL = environment.uptimeTvlApi;

export const updateAssetTvl = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    const publicClient = createPublicClient({
      chain: chainIdtoChain[chainId],
      transport: http(config.specificParams.metadata.rpcUrls.default.http[0]),
    });
    const sdk = new IonicSdk(publicClient, undefined, config);

    const [poolIndexes, pools] = await sdk.contracts.PoolDirectory.read.getActivePools();

    if (!pools.length || !poolIndexes.length) {
      throw `Error occurred during saving assets tvl to database: pools not found`;
    }

    const totalAssets: NativePricedIonicAsset[] = [];
    const results: {
      cTokenAddress: string;
      underlyingAddress: string;
      tvlUnderlying: number;
      tvlNative: number;
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
          const tvlUnderlyingBig = await cTokenContract.read.getTotalUnderlyingSupplied();
          const tvlUnderlying = Number(
            utils.formatUnits(tvlUnderlyingBig, asset.underlyingDecimals),
          );
          const tvlNative =
            Number(utils.formatUnits(tvlUnderlyingBig, asset.underlyingDecimals)) *
            Number(utils.formatUnits(asset.underlyingPrice));

          results.push({
            cTokenAddress: asset.cToken,
            underlyingAddress: asset.underlyingToken,
            tvlUnderlying,
            tvlNative,
          });
        } catch (exception) {
          console.error(exception);
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
        underlying_address: r.underlyingAddress.toLocaleLowerCase(),
        info: {
          tvlUnderlying: r.tvlUnderlying,
          tvlNative: r.tvlNative,
          createdAt: new Date().getTime(),
        },
      }));
    await axios.get(HEARTBEAT_API_URL);

    const { error } = await supabase.from(environment.supabaseAssetTvlTableName).insert(rows);

    if (error) {
      throw `Error occurred during saving asset tvl to database: ${error.message}`;
    }
  } catch (err) {
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
      return {
        statusCode: 500,
        body: JSON.stringify({ message: err }),
      };
    }
  };

export default createAssetTvlHandler;