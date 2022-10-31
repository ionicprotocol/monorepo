import { Handler } from '@netlify/functions';
import { rpcUrls } from '../assets';
import { SupportedChains } from '../config';
import { updatePluginData } from '../controllers';

const handler: Handler = async (event, context) => {
  await updatePluginData(SupportedChains.polygon, rpcUrls[SupportedChains.polygon]);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'done' }),
  };
};

export { handler };
