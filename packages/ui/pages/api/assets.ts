import type { AssetReward } from '@ionicprotocol/types';
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

import { config } from '@ui/config/index';
import { SUPPORTED_NETWORKS_REGEX } from '@ui/constants/index';

export type AssetsResponse = {
  [asset: string]: AssetReward[];
};

const querySchema = yup.object().shape({
  chainIds: yup
    .array()
    .of(yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required())
    .required(),
});
type Query = yup.InferType<typeof querySchema>;

const handler = async (request: NextApiRequest, response: NextApiResponse<AssetsResponse>) => {
  let validatedQuery: Query | null = null;
  try {
    querySchema.validateSync(request.body);
    validatedQuery = request.body as Query;
  } catch (error) {
    return response.status(400);
  }
  const { chainIds } = validatedQuery;
  const client = createClient(config.supabaseUrl, config.supabasePublicKey);

  const databaseResponse = await client
    .from(config.supabaseAssetApyTableName)
    .select<'rewards,address', { address: string; rewards: AssetReward[] }>('rewards,address')
    .in(
      'chain_id',
      chainIds.map((chainId) => parseInt(chainId as string, 10))
    );

  if (databaseResponse.error) {
    return response.status(500);
  }

  if (databaseResponse.data && databaseResponse.data.length > 0) {
    return response.json(
      databaseResponse.data.reduce((acc: AssetsResponse, cur) => {
        acc[cur.address] = cur.rewards;
        return acc;
      }, {})
    );
  } else {
    return response.json({});
  }
};

export default handler;
