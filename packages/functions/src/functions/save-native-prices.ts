import { Handler } from '@netlify/functions';
import axios from 'axios';
import { bsc, polygon, moonbeam } from '@midas-capital/chains';

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

const handler: Handler = async (event, context) => {
  const [chainIds, cgIds] = Object.entries(NATIVE_ASSETS);
  await getUSDPriceOf(cgIds);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'done' }),
  };
};

export { handler };
