import type { AssetPrice } from '@ionicprotocol/types';
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

import { config } from '@ui/config/index';
import { SUPPORTED_NETWORKS_REGEX, VALID_ADDRESS_REGEX } from '@ui/constants/index';

const querySchema = yup.object().shape({
  chainId: yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required(),
  milliSeconds: yup.string().required(),
  underlyingAddress: yup
    .string()
    .matches(VALID_ADDRESS_REGEX, 'Not a valid underlying address')
    .required()
});
type Query = yup.InferType<typeof querySchema>;

const handler = async (request: NextApiRequest, response: NextApiResponse<AssetPrice[]>) => {
  let validatedQuery: Query | null = null;
  try {
    querySchema.validateSync(request.query);
    validatedQuery = request.query as Query;
  } catch (error) {
    return response.status(400);
  }
  const { underlyingAddress, milliSeconds, chainId } = validatedQuery;
  const client = createClient(config.supabaseUrl, config.supabasePublicKey);

  const databaseResponse = await client
    .from(config.supabaseAssetPriceTableName)
    .select<'info, created_at', { created_at: string; info: AssetPrice }>('info, created_at')
    .filter('info', 'not.eq', null)
    .filter('created_at', 'not.lt', new Date(Number(milliSeconds)).toISOString())
    .eq('chain_id', parseInt(chainId as string, 10))
    .eq('underlying_address', (underlyingAddress as string).toLowerCase())
    .order('created_at', { ascending: true });

  if (databaseResponse.error) {
    return response.status(500);
  }

  if (databaseResponse.data && databaseResponse.data.length > 0) {
    return response.json(databaseResponse.data.map((data) => data.info));
  } else {
    return response.json([]);
  }
};

export default handler;
