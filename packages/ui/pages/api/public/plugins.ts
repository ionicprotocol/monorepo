import {
  arbitrum,
  bsc,
  chapel,
  ethereum,
  ganache,
  neondevnet,
  polygon
} from '@ionicprotocol/chains';
import type { DeployedPlugins as DeployedPluginsType } from '@ionicprotocol/types';
import { SupportedChains } from '@ionicprotocol/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

import { SUPPORTED_NETWORKS_REGEX, VALID_ADDRESS_REGEX } from '@ui/constants/index';

const querySchema = yup.object().shape({
  chainId: yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required(),
  marketAddress: yup.string().matches(VALID_ADDRESS_REGEX, 'Not a valid market address').required()
});
type Query = yup.InferType<typeof querySchema>;

export const deployedPlugins: { [chainId: string]: DeployedPluginsType } = {
  [SupportedChains.bsc]: bsc.deployedPlugins,
  [SupportedChains.polygon]: polygon.deployedPlugins,
  [SupportedChains.ganache]: ganache.deployedPlugins,
  [SupportedChains.chapel]: chapel.deployedPlugins,
  [SupportedChains.neon_devnet]: neondevnet.deployedPlugins,
  [SupportedChains.arbitrum]: arbitrum.deployedPlugins,
  [SupportedChains.ethereum]: ethereum.deployedPlugins
};

const handler = (request: NextApiRequest, response: NextApiResponse<string>) => {
  let validatedQuery: Query | null = null;
  try {
    querySchema.validateSync(request.query);
    validatedQuery = request.query as Query;
  } catch (error) {
    return response.status(400);
  }
  const { marketAddress, chainId } = validatedQuery;

  const res = Object.entries(deployedPlugins[chainId]).find(([plugin, info]) => {
    return info.market === marketAddress && !!plugin;
  });

  const plugin = res ? res[0] : '';

  return response.json(plugin);
};

export default handler;
