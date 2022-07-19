import { createClient } from '@supabase/supabase-js';
import { config } from '@ui/config/index';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { underlyingAddress, pluginAddress, rewardAddress } = req.query;

  const client = createClient(config.supabaseUrl, config.supabasePublicKey);
  let pricePerShares;

  if (rewardAddress) {
    pricePerShares = await client
      .from('apy_flywheel')
      .select('pricePerShare,created_at')
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('rewardAddress', (rewardAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .order('created_at', { ascending: false })
      .limit(2);
  } else {
    pricePerShares = await client
      .from('apy')
      .select('pricePerShare,created_at')
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .order('created_at', { ascending: false })
      .limit(2);
  }

  if (!pricePerShares.error) {
    if (pricePerShares.data.length) {
      const price1 = pricePerShares.data[0].pricePerShare;
      const price2 = pricePerShares.data[1].pricePerShare;
      const date1 = pricePerShares.data[0].created_at;
      const date2 = pricePerShares.data[1].created_at;
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
      error: pricePerShares.error.message,
    });
  }
};

export default handler;
