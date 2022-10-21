import { createClient, PostgrestResponse } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

import { config } from '@ui/config/index';
import { SUPPORTED_NETWORKS_REGEX, VALID_ADDRESS_REGEX } from '@ui/constants/index';
import { APYResponse } from '@ui/types/ComponentPropsType';

const querySchema = yup.object().shape({
  chain: yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required(),
  underlyingAddress: yup
    .string()
    .matches(VALID_ADDRESS_REGEX, 'Not a valid underlying asset address')
    .required(),
  pluginAddress: yup.string().matches(VALID_ADDRESS_REGEX, 'Not a valid plugin address').required(),
  rewardAddress: yup.string().matches(VALID_ADDRESS_REGEX, 'Not a valid reward asset address'),
});

type Query = yup.InferType<typeof querySchema>;

interface SupabaseRow {
  created_at: string;
}

interface MarketState extends SupabaseRow {
  totalAssets: string;
  totalSupply: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<APYResponse>) => {
  let validatedQuery: Query | null = null;
  try {
    querySchema.validateSync(req.query);
    validatedQuery = req.query as Query;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).send({
        error: error.message,
      });
    } else {
      throw error;
    }
  }

  if (req.query.rewardAddress) {
    return res.json(await rewardTokenAPY(validatedQuery));
  } else {
    return res.json(await underlyingTokenAPY(validatedQuery));
  }
};
/**
 * Calculates the % growth of Reward Tokens in Time Interval
 * @param query Validated NextApiRequest query
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function rewardTokenAPY(query: Query): Promise<APYResponse> {
  // TODO https://github.com/Midas-Protocol/monorepo/issues/543
  throw 'Not yet supported.';
  // const client = createClient(config.supabaseUrl, config.supabasePublicKey);
  // const dateLimit = new Date();
  // dateLimit.setDate(dateLimit.getDate() - parseInt('7', 10));
  // const { chain, pluginAddress, rewardAddress, underlyingAddress } = query;

  // const [start, end] = await Promise.all([
  //   client
  //     .from<FlywheelState>(config.supabaseFlywheelTableName)
  //     .select('totalAssets,created_at')
  //     .eq('chain', parseInt(chain as string, 10))
  //     .eq('pluginAddress', (pluginAddress as string).toLowerCase())
  //     .eq('rewardAddress', (rewardAddress as string).toLowerCase())
  //     .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
  //     .gte('created_at', dateLimit.toISOString())
  //     .order('created_at', { ascending: true })
  //     .limit(1),
  //   client
  //     .from<FlywheelState>(config.supabaseFlywheelTableName)
  //     .select('totalAssets,created_at')
  //     .eq('chain', parseInt(chain as string, 10))
  //     .eq('pluginAddress', (pluginAddress as string).toLowerCase())
  //     .eq('rewardAddress', (rewardAddress as string).toLowerCase())
  //     .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
  //     .order('created_at', { ascending: false })
  //     .limit(1),
  // ]);

  // if (
  //   start.error ||
  //   end.error ||
  //   start.data.length === 0 ||
  //   end.data.length === 0 ||
  //   start.data[0].created_at === end.data[0].created_at ||
  //   parseFloat(start.data[0].totalAssets) === 0 ||
  //   parseFloat(end.data[0].totalAssets) === 0
  // ) {
  //   return { apy: undefined, error: 'Not enough data yet to calculate APY' };
  // }

  // const [startAssets, endAssets] = [
  //   parseFloat(start.data[0].totalAssets),
  //   parseFloat(end.data[0].totalAssets),
  // ];

  // const date1 = end.data[0].created_at;
  // const date2 = start.data[0].created_at;
  // const dateDelta = new Date(date1).getTime() - new Date(date2).getTime();
  // const millisecondsInADay = 86_400_000;
  // return { apy: (Math.log(endAssets / startAssets) / dateDelta) * millisecondsInADay * 365 };
}

async function underlyingTokenAPY(query: Query): Promise<APYResponse> {
  const millisecondsInADay = 86_400_000;
  const client = createClient(config.supabaseUrl, config.supabasePublicKey);
  const dateLimit: Date = new Date(Date.now() - 7 * millisecondsInADay);
  const { chain, pluginAddress, underlyingAddress } = query;

  const [start, end] = await Promise.all([
    client
      .from(config.supabasePluginTableName)
      .select('totalAssets,totalSupply,created_at')
      .eq('chain', parseInt(chain as string, 10))
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .gte('created_at', dateLimit.toISOString())
      .order('created_at', { ascending: true })
      .limit(1),
    client
      .from(config.supabasePluginTableName)
      .select('totalAssets,totalSupply,created_at,externalAPY')
      .eq('chain', parseInt(chain as string, 10))
      .eq('pluginAddress', (pluginAddress as string).toLowerCase())
      .eq('underlyingAddress', (underlyingAddress as string).toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  if (
    start.error ||
    end.error ||
    start.data.length === 0 ||
    end.data.length === 0 ||
    start.data[0].created_at === end.data[0].created_at
  ) {
    return { apy: undefined, error: 'Not enough data yet to calculate APY' };
  }

  let averageAPY = 0;

  const dateEnd = end.data[0].created_at;
  const dateStart = start.data[0].created_at;

  const timeDelta = new Date(dateEnd).getTime() - new Date(dateStart).getTime();
  const pricePerShare2 = pricePerShare(end);
  const pricePerShare1 = pricePerShare(start);
  if (pricePerShare1 !== pricePerShare2) {
    // Formula origin: https://www.cuemath.com/continuous-compounding-formula/
    averageAPY = (Math.log(pricePerShare2 / pricePerShare1) / timeDelta) * millisecondsInADay * 365;
  }

  return {
    updatedAt: end.data[0].created_at,
    externalAPY: end.data[0].externalAPY ? Number(end.data[0].externalAPY) : undefined,
    apy: averageAPY,
    averageAPY,
    timeDelta,
  };
}

function pricePerShare(response: PostgrestResponse<MarketState>) {
  if (!response.data || response.data.length === 0) {
    return 0;
  }
  if (
    parseFloat(response.data[0].totalAssets) === 0 ||
    parseFloat(response.data[0].totalSupply) === 0
  ) {
    return 1;
  }

  return parseFloat(response.data[0].totalAssets) / parseFloat(response.data[0].totalSupply);
}

export default handler;
