import { Handler } from '@netlify/functions';
import { rpcUrls } from '../assets';
import { SupportedChains } from '../config';
import { updateFlywheelData, updatePluginsData } from '../controllers';

const handler: Handler = async (event, context) => {
  await updatePluginsData(SupportedChains.polygon, rpcUrls[SupportedChains.polygon]);
  await updateFlywheelData(SupportedChains.polygon, rpcUrls[SupportedChains.polygon]);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'done' }),
  };
};

export { handler };
