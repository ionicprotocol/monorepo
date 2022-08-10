import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

import { SUPPORTED_NETWORKS_REGEX, VALID_ADDRESS_REGEX } from '../../constants';

import { config } from '@ui/config/index';

const querySchema = yup.object().shape({
  chain: yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required(),
  underlyingAddress: yup
    .string()
    .matches(VALID_ADDRESS_REGEX, 'Not a valid underlying asset address')
    .required(),
  pluginAddress: yup.string().matches(VALID_ADDRESS_REGEX, 'Not a valid plugin address').required(),
  rewardAddress: yup.string().matches(VALID_ADDRESS_REGEX, 'Not a valid reward asset address'),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    querySchema.validateSync(req.query);
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).send({
        error: error.message,
      });
    } else {
      throw 'Unknown Error';
    }
  }
  const { underlyingAddress, pluginAddress, rewardAddress, chain, days = '7' } = req.query;

  const client = createClient(config.supabaseUrl, config.supabasePublicKey);
  let start, end;
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - parseInt(days as string, 10));

  if (rewardAddress) {
    start = await client
      .from(config.supabaseFlywheelTableName)
      .select('totalAssets')
      .eq('chain', parseInt(chain as string, 10))
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('rewardAddress', (rewardAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .gte('created_at', dateLimit.toISOString())
      .order('created_at', { ascending: true })
      .limit(1);

    if (start.error || !start.data.length) {
      start = await client
        .from(config.supabaseFlywheelTableName)
        .select('totalAssets')
        .eq('chain', parseInt(chain as string, 10))
        .eq('pluginAddress', (pluginAddress as string).toLowerCase())
        .eq('rewardAddress', (rewardAddress as string).toLowerCase())
        .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
        .order('created_at', { ascending: true })
        .limit(1);
    }
    end = await client
      .from(config.supabaseFlywheelTableName)
      .select('totalAssets,totalSupply')
      .eq('chain', parseInt(chain as string, 10))
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('rewardAddress', (rewardAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1);
  } else {
    start = await client
      .from(config.supabasePluginTableName)
      .select('totalAssets')
      .eq('chain', parseInt(chain as string, 10))
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .gte('created_at', dateLimit.toISOString())
      .order('created_at', { ascending: true })
      .limit(1);
    if (start.error || !start.data.length) {
      start = await client
        .from(config.supabasePluginTableName)
        .select('totalAssets')
        .eq('chain', parseInt(chain as string, 10))
        .eq('pluginAddress', (pluginAddress as string).toLowerCase())
        .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
        .order('created_at', { ascending: true })
        .limit(1);
    }
    end = await client
      .from(config.supabasePluginTableName)
      .select('totalAssets,totalSupply')
      .eq('chain', parseInt(chain as string, 10))
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1);
  }

  if (!start.error && !end.error) {
    if (start.data.length && end.data.length) {
      const price1 = parseFloat(end.data[0].totalAssets);
      const price2 = parseFloat(start.data[0].totalAssets);
      const totalSupply = parseFloat(end.data[0].totalSupply);

      const apy = (price1 - price2) / totalSupply;

      return res.json({
        apy: apy || 0,
      });
    } else {
      return res.status(400).send({
        error: 'Invalid request or not enough apy feeds',
      });
    }
  } else {
    return res.status(500).send({
      error: start.error?.message ?? end.error?.message,
    });
  }
};

export default handler;
