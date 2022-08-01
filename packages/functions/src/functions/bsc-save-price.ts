import { Handler } from '@netlify/functions';
import { rpcUrls } from '../assets';
import { SupportedChains } from '../config';
import { updateFlywheelData, updatePluginsData } from '../controllers';

const handler: Handler = async (event, context) => {
  await updatePluginsData(SupportedChains.bsc, rpcUrls[SupportedChains.bsc]);
  await updateFlywheelData(SupportedChains.bsc, rpcUrls[SupportedChains.bsc]);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'done' }),
  };
};

export { handler };
