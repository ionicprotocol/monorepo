import { SupportedChains } from '@midas-capital/types';
import { Handler } from '@netlify/functions';
import { rpcUrls } from '../data/rpcs';

import { updatePluginData } from '../controllers';

const handler: Handler = async (event, context) => {
  const rpcURL = rpcUrls[SupportedChains.polygon];
  if (!rpcURL) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'RPC not set' }),
    };
  }
  await updatePluginData(SupportedChains.polygon, rpcURL);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'done' }),
  };
};

export { handler };
