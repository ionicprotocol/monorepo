import { Handler } from '@netlify/functions';
import { rpcUrls } from '../assets';
import { SupportedChains } from '../config';
import { updatePluginRewards } from '../controllers';

const handler: Handler = async (event, context) => {
  await updatePluginRewards(SupportedChains.polygon, rpcUrls[SupportedChains.polygon]);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'done' }),
  };
};

export { handler };
