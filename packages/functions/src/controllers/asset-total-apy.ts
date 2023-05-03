import { NativePricedFuseAsset, SupportedChains, assetSymbols } from '@midas-capital/types';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { MidasSdk, filterOnlyObjectProperties } from '@midas-capital/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Handler } from '@netlify/functions';
import { chainIdToConfig } from '@midas-capital/chains';
import { BigNumber, Contract, ethers, utils } from 'ethers';
import { getAPYProviders } from '../providers/rewards/assets';

export const MINUTES_PER_YEAR = 24 * 365 * 60;

export const ankrBNBContractAddress = '0xCb0006B31e6b403fEeEC257A8ABeE0817bEd7eBa';
export const aprDays = 7;
export const ankrBNBContractABI = [
  {
    inputs: [
      { internalType: 'address', name: 'addr', type: 'address' },
      { internalType: 'uint256', name: 'day', type: 'uint256' },
    ],
    name: 'averagePercentageRate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const getAnkrBNBContract = (sdk: MidasSdk) => {
  return new Contract(ankrBNBContractAddress, ankrBNBContractABI, sdk.provider);
};

export interface TotalApy {
  cTokenAddress: string;
  underlyingAddress: string;
  supplyApy: number;
  ankrBNBApr?: number;
  compoundingApy?: number;
}

export const updateAssetTotalApy = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    const provider = new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default.http[0]);
    const sdk = new MidasSdk(provider, config);

    const [poolIndexes, pools] = await sdk.contracts.FusePoolDirectory.callStatic.getActivePools();

    if (!pools.length || !poolIndexes.length) {
      throw `Error occurred during saving assets total apy to database: pools not found`;
    }

    const totalAssets: NativePricedFuseAsset[] = [];
    const results: TotalApy[] = [];

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

    const apyProviders = await getAPYProviders(chainId, {
      chainId,
      provider,
    });

    const assetInfos = await Promise.all(
      Object.entries(apyProviders).map(async ([assetAddress, assetAPYProvider]) => {
        return {
          asset: assetAddress,
          rewards: await assetAPYProvider.getApy(assetAddress, {}),
        };
      })
    );

    await Promise.all(
      totalAssets.map(async (asset) => {
        try {
          //get supplyAPY
          const supplyApy = sdk.ratePerBlockToAPY(
            asset.supplyRatePerBlock,
            config.specificParams.blocksPerYear.div(BigNumber.from(MINUTES_PER_YEAR)).toNumber()
          );

          let result: TotalApy = {
            cTokenAddress: asset.cToken.toLowerCase(),
            underlyingAddress: asset.underlyingToken.toLowerCase(),
            supplyApy,
          };

          // hardcoded ankrBNBApr
          let ankrBNBApr;

          if (asset.underlyingSymbol === assetSymbols.ankrBNB) {
            const contract = getAnkrBNBContract(sdk);
            const apr = await contract.callStatic.averagePercentageRate(
              asset.underlyingToken,
              aprDays
            );
            ankrBNBApr = Number(utils.formatUnits(apr));
          }

          if (ankrBNBApr !== undefined) {
            result = { ...result, ankrBNBApr };
          }

          //get asset rewards
          let compoundingApy = 0;

          if (assetInfos) {
            assetInfos.map((info) => {
              if (info.asset.toLowerCase() === asset.underlyingToken.toLowerCase()) {
                info.rewards.map((reward) => {
                  if (reward.apy) {
                    compoundingApy += reward.apy;
                  }
                });
              }
            });
          }

          if (compoundingApy > 0) {
            result = { ...result, compoundingApy };
          }

          results.push(result);
        } catch (exception) {
          console.error(exception);
          await functionsAlert(
            `Functions.asset-total-apy: CToken '${asset.cToken}' / Chain '${chainId}'`,
            JSON.stringify(exception)
          );
        }
      })
    );

    const rows = results
      .filter((r) => !!r)
      .map((r) => {
        const { cTokenAddress, underlyingAddress, ...rest } = r;
        return {
          chain_id: chainId,
          ctoken_address: r.cTokenAddress.toLowerCase(),
          underlying_address: r.underlyingAddress.toLocaleLowerCase(),
          info: {
            ...rest,
            createdAt: new Date().getTime(),
          },
        };
      });

    const { error } = await supabase.from(environment.supabaseAssetTotalApyTableName).insert(rows);

    if (error) {
      throw `Error occurred during saving asset total apy to database: ${error.message}`;
    }
  } catch (err) {
    await functionsAlert('Functions.asset-total-apy: Generic Error', JSON.stringify(err));
  }
};

export const createAssetTotalApyHandler =
  (chain: SupportedChains): Handler =>
  async () => {
    try {
      await updateAssetTotalApy(chain);

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

export default createAssetTotalApyHandler;
