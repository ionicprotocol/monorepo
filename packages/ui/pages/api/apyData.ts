import { createClient, PostgrestResponse } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

import { config } from '@ui/config/index';
import { SUPPORTED_NETWORKS_REGEX, VALID_ADDRESS_REGEX } from '@ui/constants/index';

const querySchema = yup.object().shape({
  chain: yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required(),
  underlyingAddress: yup
    .string()
    .matches(VALID_ADDRESS_REGEX, 'Not a valid underlying asset address')
    .required(),
  pluginAddress: yup.string().matches(VALID_ADDRESS_REGEX, 'Not a valid plugin address').required(),
  rewardAddress: yup.string().matches(VALID_ADDRESS_REGEX, 'Not a valid reward asset address'),
});

interface SupabaseRow {
  created_at: Date;
}

interface MarketState extends SupabaseRow {
  totalAssets: string;
  totalSupply: string;
  chain: number;
}

interface PluginState extends MarketState {
  underlyingAddress: string;
  pluginAddress: string;
}

interface FlywheelState extends MarketState {
  underlyingAddress: string;
  rewardAddress: string;
  pluginAddress: string;
}

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
  let start: PostgrestResponse<MarketState>, end: PostgrestResponse<MarketState>;
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - parseInt(days as string, 10));

  if (rewardAddress) {
    start = await client
      .from<FlywheelState>(config.supabaseFlywheelTableName)
      .select('totalAssets,totalSupply,created_at')
      .eq('chain', parseInt(chain as string, 10))
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('rewardAddress', (rewardAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .gte('created_at', dateLimit.toISOString())
      .order('created_at', { ascending: true })
      .limit(1);

    if (start.error || !start.data.length) {
      start = await client
        .from<FlywheelState>(config.supabaseFlywheelTableName)
        .select('totalAssets,totalSupply,created_at')
        .eq('chain', parseInt(chain as string, 10))
        .eq('pluginAddress', (pluginAddress as string).toLowerCase())
        .eq('rewardAddress', (rewardAddress as string).toLowerCase())
        .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
        .order('created_at', { ascending: true })
        .limit(1);
    }
    end = await client
      .from<FlywheelState>(config.supabaseFlywheelTableName)
      .select('totalAssets,totalSupply,created_at')
      .eq('chain', parseInt(chain as string, 10))
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('rewardAddress', (rewardAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1);
  } else {
    start = await client
      .from<PluginState>(config.supabasePluginTableName)
      .select('totalAssets,totalSupply,created_at')
      .eq('chain', parseInt(chain as string, 10))
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .gte('created_at', dateLimit.toISOString())
      .order('created_at', { ascending: true })
      .limit(1);
    if (start.error || !start.data.length) {
      start = await client
        .from<PluginState>(config.supabasePluginTableName)
        .select('totalAssets,totalSupply,created_at')
        .eq('chain', parseInt(chain as string, 10))
        .eq('pluginAddress', (pluginAddress as string).toLowerCase())
        .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
        .order('created_at', { ascending: true })
        .limit(1);
    }
    end = await client
      .from<PluginState>(config.supabasePluginTableName)
      .select('totalAssets,totalSupply,created_at')
      .eq('chain', parseInt(chain as string, 10))
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1);
  }

  if (!start.error && !end.error) {
    const pricePerShare2 = pricePerShare(end);
    const pricePerShare1 = pricePerShare(start);

    let apy = 0;
    if (pricePerShare1 > 0 && pricePerShare2 > 0) {
      const date1 = end.data[0].created_at;
      const date2 = start.data[0].created_at;
      const dateDelta = new Date(date1).getTime() - new Date(date2).getTime();
      // Formula origin: https://www.cuemath.com/continuous-compounding-formula/
      const millisecondsInADay = 86_400_000;
      apy = (Math.log(pricePerShare2 / pricePerShare1) / dateDelta) * millisecondsInADay * 365;
    }

    return res.json({
      apy,
    });
  } else {
    return res.status(500).send({
      error: start.error?.message ?? end.error?.message,
    });
  }
};

function pricePerShare(response: PostgrestResponse<MarketState>) {
  if (!response.data || response.data.length === 0) {
    return 0;
  }
  return parseFloat(response.data[0].totalAssets) / parseFloat(response.data[0].totalSupply);
}

export default handler;
