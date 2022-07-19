import { createClient } from '@supabase/supabase-js';
import { config } from '@ui/config/index';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { underlyingAddress, pluginAddress, rewardAddress, days = '7' } = req.query;

  const client = createClient(config.supabaseUrl, config.supabasePublicKey);
  let start, end;
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - parseInt(days as string, 10));

  if (rewardAddress) {
    start = await client
      .from(config.supabaseFlywheelTableName)
      .select('pricePerShare,created_at')
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('rewardAddress', (rewardAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .gte('created_at', dateLimit)
      .order('created_at', { ascending: false })
      .limit(1);
    if (start.error) {
      start = await client
        .from(config.supabaseFlywheelTableName)
        .select('pricePerShare,created_at')
        .eq('pluginAddress', (pluginAddress as string).toLowerCase())
        .eq('rewardAddress', (rewardAddress as string).toLowerCase())
        .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
        .order('created_at', { ascending: true })
        .limit(1);
    }
    end = await client
      .from(config.supabaseFlywheelTableName)
      .select('pricePerShare,created_at')
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('rewardAddress', (rewardAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1);
  } else {
    start = await client
      .from(config.supabasePluginTableName)
      .select('pricePerShare,created_at')
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .gte('created_at', dateLimit)
      .order('created_at', { ascending: false })
      .limit(1);
    if (start.error) {
      start = await client
        .from(config.supabasePluginTableName)
        .select('pricePerShare,created_at')
        .eq('pluginAddress', (pluginAddress as string).toLowerCase())
        .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
        .order('created_at', { ascending: true })
        .limit(1);
    }
    end = await client
      .from(config.supabasePluginTableName)
      .select('pricePerShare,created_at')
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1);
  }

  if (!start.error && !end.error) {
    if (start.data.length && end.data.length) {
      const price1 = end.data[0].pricePerShare;
      const price2 = start.data[0].pricePerShare;
      const date1 = end.data[0].created_at;
      const date2 = start.data[1].created_at;
      const dateDelta = new Date(date1).getTime() - new Date(date2).getTime();
      const apy = (Math.log(price1 / price2) / dateDelta) * 86400000 * 365;

      return res.json({
        apy,
      });
    } else {
      return res.status(400).send({
        error: 'Invalid request',
      });
    }
  } else {
    return res.status(500).send({
      error: start.error?.message ?? end.error?.message,
    });
  }
};

export default handler;
