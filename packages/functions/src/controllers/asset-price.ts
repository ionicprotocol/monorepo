import { SupportedChains } from '@ionicprotocol/types';
import { BigNumber, constants, utils } from 'ethers';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { IonicSdk } from '@ionicprotocol/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Handler } from '@netlify/functions';
import { chainIdToConfig } from '@ionicprotocol/chains';
import axios from 'axios';

export const HEARTBEAT_API_URL = 'https://uptime.betterstack.com/api/v1/heartbeat/hxW4PWkrQG61T8iMq57iNY9i';
export const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=';
export const DEFI_LLAMA_API = 'https://coins.llama.fi/prices/current/';

export const updateAssetPrice = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    const sdk = new IonicSdk(
      new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default.http[0]),
      config
    );
    const mpo = sdk.createMasterPriceOracle();

    //get USD price
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

    const results = await Promise.all(
      config.assets.map(async (asset) => {
        try {
          const underlyingPrice = await mpo.callStatic.price(asset.underlying);
          const underlyingPriceNum = Number(utils.formatUnits(underlyingPrice));
          const usdPrice = underlyingPriceNum * price;
          return {
            chainId,
            underlyingAddress: asset.underlying,
            underlyingPriceNum: underlyingPriceNum,
            usdPrice,
          };
        } catch (exception) {
          console.error(exception);
          await functionsAlert(
            `Functions.asset-price: Asset '${asset.name}(${asset.underlying})' / Chain '${chainId}'`,
            JSON.stringify(exception)
          );
        }
      })
    );

    const rows = results
      .filter((r) => !!r)
      .map((r) => ({
        chain_id: chainId,
        underlying_address: r?.underlyingAddress.toLowerCase(),
        info: {
          underlyingPrice: r?.underlyingPriceNum,
          usdPrice: r?.usdPrice,
          createdAt: new Date().getTime(),
        },
      }));
    await axios.get(HEARTBEAT_API_URL);
    const { error } = await supabase.from(environment.supabaseAssetPriceTableName).insert(rows);

    if (error) {
      throw `Error occurred during saving asset prices to database: ${error.message}`;
    }
  } catch (err) {
    await functionsAlert('Functions.asset-price: Generic Error', JSON.stringify(err));
  }
};

export const createAssetPriceHandler =
  (chain: SupportedChains): Handler =>
  async () => {
    try {
      await updateAssetPrice(chain);

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

export default createAssetPriceHandler;
