import { SupportedChains } from '@ionicprotocol/types';
import { Handler } from '@netlify/functions';
import { rpcUrls } from '../data/rpcs';

import { updatePluginData } from '../controllers';

const handler: Handler = async (event, context) => {
  const rpcURL = rpcUrls[SupportedChains.mode];
  if (!rpcURL) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'RPC not set' }),
    };
  }
  await updatePluginData(SupportedChains.mode, rpcURL);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'done' }),
  };
};

export { handler };
