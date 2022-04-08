import dotenv from 'dotenv';
import { setPriceAndRepeat } from './src';
import { SupportedChains } from '@midas-capital/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';

dotenv.config();

(async function () {
  const chainId: number = process.env.TARGET_CHAIN_ID
    ? parseInt(process.env.TARGET_CHAIN_ID)
    : SupportedChains.ganache;
  const provider = new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER_URL);
  setPriceAndRepeat(chainId, provider, null, 0);
})();
