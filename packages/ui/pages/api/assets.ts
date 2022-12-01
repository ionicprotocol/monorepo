import type { AssetReward, Reward } from '@midas-capital/types';
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

import { config } from '@ui/config/index';
import { SUPPORTED_NETWORKS_REGEX } from '@ui/constants/index';

export type AssetsResponse = {
  [asset: string]: AssetReward[];
};

const querySchema = yup.object().shape({
  chainId: yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required(),
});
type Query = yup.InferType<typeof querySchema>;

const handler = async (request: NextApiRequest, response: NextApiResponse<AssetsResponse>) => {
  let validatedQuery: Query | null = null;
  try {
    querySchema.validateSync(request.query);
    validatedQuery = request.query as Query;
  } catch (error) {
    return response.status(400);
  }
  const { chainId } = validatedQuery;
  const client = createClient(config.supabaseUrl, config.supabasePublicKey);
  console.log({ chainId, table: config.supabaseAssetApyTableName });

  const databaseResponse = await client
    .from(config.supabaseAssetApyTableName)
    .select<'rewards,address', { rewards: AssetReward[]; address: string }>('rewards,address')
    .eq('chain_id', parseInt(chainId as string, 10));

  if (databaseResponse.error) {
    return response.status(500);
  }
  console.log({ databaseResponse, data: databaseResponse.data });
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
