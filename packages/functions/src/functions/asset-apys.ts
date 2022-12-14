import { SupportedChains } from '@midas-capital/types';
import { Handler } from '@netlify/functions';
import updateAssetApy from '../controllers/asset-apy';
import { rpcUrls } from '../data/rpcs';

export const createHandler =
  (chain: SupportedChains): Handler =>
  async (event, context) => {
    const rpcURL = rpcUrls[chain];
    if (!rpcURL) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'RPC not set' }),
      };
    }
    await updateAssetApy(chain, rpcURL);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'done' }),
    };
  };
