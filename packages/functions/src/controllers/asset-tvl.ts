import { NativePricedFuseAsset, SupportedChains } from '@ionicprotocol/types';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { MidasSdk, filterOnlyObjectProperties } from '@ionicprotocol/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Handler } from '@netlify/functions';
import { chainIdToConfig } from '@ionicprotocol/chains';
import { utils } from 'ethers';

export const updateAssetTvl = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    const sdk = new MidasSdk(
      new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default.http[0]),
      config
    );

    const [poolIndexes, pools] = await sdk.contracts.FusePoolDirectory.callStatic.getActivePools();

    if (!pools.length || !poolIndexes.length) {
      throw `Error occurred during saving assets tvl to database: pools not found`;
    }

    const totalAssets: NativePricedFuseAsset[] = [];
    const results: {
      cTokenAddress: string;
      underlyingAddress: string;
      tvlUnderlying: number;
      tvlNative: number;
    }[] = [];

    await Promise.all(
      pools.map(async ({ comptroller }) => {
        const assets: NativePricedFuseAsset[] = (
          await sdk.contracts.FusePoolLens.callStatic
            .getPoolAssetsWithData(comptroller)
            .catch(() => [])
        ).map(filterOnlyObjectProperties);

        totalAssets.push(...assets);
      })
    );

    await Promise.all(
      totalAssets.map(async (asset) => {
        try {
          const cTokenContract = sdk.createCTokenWithExtensions(asset.cToken);
          const tvlUnderlyingBig = await cTokenContract.callStatic.getTotalUnderlyingSupplied();
          const tvlUnderlying = Number(
            utils.formatUnits(tvlUnderlyingBig, asset.underlyingDecimals)
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
            JSON.stringify(exception)
          );
        }
      })
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
