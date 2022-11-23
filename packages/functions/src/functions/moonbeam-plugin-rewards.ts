import { SupportedChains } from '@midas-capital/types';
import { Handler } from '@netlify/functions';
import { rpcUrls } from '../data/rpcs';

import { updatePluginRewards } from '../controllers';
import { updateAssetRewards } from '../controllers';
import { functionsAlert } from '../alert';
const handler: Handler = async (event, context) => {
  const rpcURL = rpcUrls[SupportedChains.moonbeam];
  if (!rpcURL) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'RPC not set' }),
    };
  }
  await Promise.all([
    updatePluginRewards(SupportedChains.moonbeam, rpcURL).catch((error) =>
      functionsAlert(
        `General Error: updatePluginRewards / Chain '${SupportedChains.moonbeam}'`,
        JSON.stringify(error)
      )
    ),
    updateAssetRewards(SupportedChains.moonbeam, rpcURL).catch((error) =>
      functionsAlert(
        `General Error: updateAssetRewards / Chain '${SupportedChains.moonbeam}'`,
        JSON.stringify(error)
      )
    ),
  ]);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'done' }),
  };
};

export { handler };
