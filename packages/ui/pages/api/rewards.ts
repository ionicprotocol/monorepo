import type { Rewards } from '@midas-capital/types';
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

import { config } from '@ui/config/index';
import { SUPPORTED_NETWORKS_REGEX, VALID_ADDRESS_REGEX } from '@ui/constants/index';

type RewardsResponse = Rewards;

const querySchema = yup.object().shape({
  chainId: yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required(),
  pluginAddress: yup.string().matches(VALID_ADDRESS_REGEX, 'Not a valid plugin address').required(),
});
type Query = yup.InferType<typeof querySchema>;

const handler = async (request: NextApiRequest, response: NextApiResponse<RewardsResponse>) => {
  let validatedQuery: Query | null = null;
  try {
    querySchema.validateSync(request.query);
    validatedQuery = request.query as Query;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return response.status(400);
    } else {
      throw error;
    }
  }
  const { pluginAddress, chainId } = validatedQuery;
  const client = createClient(config.supabaseUrl, config.supabasePublicKey);
  const databaseResponse = await client
    .from(config.supabasePluginRewardsTableName)
    .select<'rewards', Rewards>('rewards')
    .eq('chain', parseInt(chainId as string, 10))
    .eq('pluginAddress', (pluginAddress as string).toLowerCase())
    .order('created_at', { ascending: false })
    .limit(1);

  if (databaseResponse.data && databaseResponse.data.length > 0) {
    return databaseResponse.data[0];
  }
};

export default handler;
