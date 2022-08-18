import { bsc, moonbeam, polygon } from '@midas-capital/chains';
import { Handler } from '@netlify/functions';
import axios from 'axios';
import { functonsAlert } from '../alert';
import { config, supabase } from '../config';

const NATIVE_ASSETS = {
  [bsc.chainId]: bsc.specificParams.cgId,
  [polygon.chainId]: polygon.specificParams.cgId,
  [moonbeam.chainId]: moonbeam.specificParams.cgId,
};

async function getUSDPriceOf(cgIds: string[]): Promise<number[]> {
  const { data } = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${cgIds.join(',')}`
  );
  return cgIds.map((cgId) => (data[cgId] ? data[cgId].usd : 1));
}

const handler: Handler = async () => {
  const chainIds = Object.keys(NATIVE_ASSETS);
  const cgIds = Object.values(NATIVE_ASSETS);
  const prices = await getUSDPriceOf(cgIds);

  const upserts = prices.map((price, index) => ({
    chainId: chainIds[index],
    usd: price,
  }));

  const { error } = await supabase.from(config.supabaseNativePricesTableName).upsert(upserts);
  if (error) {
    await functonsAlert('Saving Native Prices', error.message);
    throw `Error occurred during saving native prices:  ${error.message}`;
  } else {
    console.log(`Successfully updated native prices for: ${chainIds.join(', ')}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'done' }),
  };
};

export { handler };
