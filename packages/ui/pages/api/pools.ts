import { JsonRpcProvider } from '@ethersproject/providers';
import { MidasSdk } from '@midas-capital/sdk';
import { FusePoolData, SupportedChains } from '@midas-capital/types';
import { utils } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

import { config } from '@ui/config/index';
import { SUPPORTED_NETWORKS_REGEX, VALID_ADDRESS_REGEX } from '@ui/constants/index';
import { chainIdToConfig, FusePoolsPerChain } from '@ui/types/ChainMetaData';
import { poolSort } from '@ui/utils/sorts';

const querySchema = yup.object().shape({
  chains: yup
    .array()
    .of(yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required()),
  address: yup.string().matches(VALID_ADDRESS_REGEX, 'Not a valid address'),
});

const handler = async (
  request: NextApiRequest,
  response: NextApiResponse<{ chainPools: FusePoolsPerChain; allPools: FusePoolData[] }>
) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 'max-age=86400, s-maxage=86400');

  querySchema.validateSync(request.body);

  const { chains, address }: { chains: SupportedChains[]; address?: string } = request.body;
  const validAddress = address ? utils.getAddress(address) : undefined;

  const sdks = chains.map((id) => {
    const config = chainIdToConfig[id];

    return new MidasSdk(
      new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default),
      config
    );
  });

  const chainPools: FusePoolsPerChain = {};
  const allPools: FusePoolData[] = [];

  try {
    await Promise.all(
      sdks.map(async (sdk) => {
        const pools = await sdk.fetchPoolsManual(validAddress ? { from: validAddress } : {});

        let visiblePools: FusePoolData[] = [];
        if (pools && pools.length !== 0) {
          type configKey = keyof typeof config;

          const hidePools = (config[`hidePools${sdk.chainId}` as configKey] as string[]) || [];
          pools.map((pool) => {
            if (pool && !hidePools.includes(pool.id.toString())) {
              visiblePools.push({ ...pool, chainId: Number(sdk.chainId) });
            }
          });
          if (!visiblePools?.length) {
            visiblePools = poolSort(visiblePools);
          }
        }

        chainPools[sdk.chainId] = visiblePools;
        allPools.push(...visiblePools);
      })
    );
  } catch {
    console.warn(`Unable to fetch pools data`);
  }

  response.json({ chainPools, allPools });
};

export default handler;
