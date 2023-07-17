import type { VaultApy } from '@ionicprotocol/types';
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

import { config } from '@ui/config/index';
import { SUPPORTED_NETWORKS_REGEX, VALID_ADDRESS_REGEX } from '@ui/constants/index';

const querySchema = yup.object().shape({
  chainId: yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required(),
  vaultAddress: yup.string().matches(VALID_ADDRESS_REGEX, 'Not a valid plugin address').required()
});
type Query = yup.InferType<typeof querySchema>;

const handler = async (request: NextApiRequest, response: NextApiResponse<VaultApy[]>) => {
  let validatedQuery: Query | null = null;
  try {
    querySchema.validateSync(request.query);
    validatedQuery = request.query as Query;
  } catch (error) {
    return response.status(400);
  }
  const { vaultAddress, chainId } = validatedQuery;
  const client = createClient(config.supabaseUrl, config.supabasePublicKey);

  const databaseResponse = await client
    .from(config.supabaseVaultApyTableName)
    .select<'info, created_at', { created_at: string; info: VaultApy }>('info, created_at')
    .eq('chain_id', parseInt(chainId as string, 10))
    .eq('vault_address', (vaultAddress as string).toLowerCase())
    .order('created_at', { ascending: true })
    .limit(100);

  if (databaseResponse.error) {
    return response.status(500);
  }

  if (databaseResponse.data && databaseResponse.data.length > 0) {
    return response.json(
      databaseResponse.data.map((data) => ({
        ...data.info,
        createdAt: new Date(data.created_at).getTime()
      }))
    );
  } else {
    return response.json([]);
  }
};

export default handler;
