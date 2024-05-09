import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { createConfig, getEnsName, http } from '@wagmi/core';
import type { Address } from 'viem';
import { mainnet } from 'viem/chains';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { fetchData } from '@ui/utils/functions';

const supabaseUrl = 'https://uoagtjstsdrjypxlkuzr.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78';
const supabase = createClient(supabaseUrl, supabaseKey);

export type QueryResponse = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  average_execution_time: any;
  context: string;
  data: {
    cols: Array<{
      base_type: string;
      display_name: string;
      effective_type: string;
      field_ref: [
        string,
        string,
        {
          'base-type': string;
        }
      ];
      name: string;
      source: string;
    }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insights: any;
    native_form: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: any;
      query: string;
    };
    results_metadata: {
      columns: Array<{
        base_type: string;
        display_name: string;
        effective_type: string;
        field_ref: [
          string,
          string,
          {
            'base-type': string;
          }
        ];
        fingerprint: {
          global: {
            'distinct-count': number;
            'nil%': number;
          };
          type: {
            'type/Number': {
              avg: number;
              max: number;
              min: number;
              q1: number;
              q3: number;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sd: any;
            };
          };
        };
        name: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        semantic_type: any;
      }>;
    };
    results_timezone: string;
    rows: Array<Array<number>>;
  };
  database_id: number;
  json_query: {
    database: number;
    middleware: {
      'add-default-userland-constraints?': boolean;
      'js-int-to-string?': boolean;
    };
    native: {
      query: string;
      'template-tags': unknown;
    };
    type: string;
  };
  row_count: number;
  running_time: number;
  started_at: string;
  status: string;
};

export type QueryData = {
  query: string;
};

/**
 * Get all supply points
 */
const usePointsForSupply = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async () => {
      const response = await Promise.all([
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT (SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2800 AS points, (Extract(epoch FROM (min5_slot - '2024-01-31')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 18) / 5 AS tokens FROM weth_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 18) / 5 AS tokens FROM weth_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-01-31'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d ) + ( SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) AS points, (Extract(epoch FROM (min5_slot - '2024-01-31')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 6) / 5 AS tokens FROM usdt_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 6) / 5 AS tokens FROM usdt_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-01-31'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d ) + ( SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) AS points, (Extract(epoch FROM (min5_slot - '2024-01-31')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 6) / 5 AS tokens FROM usdc_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 6) / 5 AS tokens FROM usdc_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-01-31'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d ) + ( SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 52000 AS points, (Extract(epoch FROM (min5_slot - '2024-01-31')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 8) / 5 AS tokens FROM wbtc_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 8) / 5 AS tokens FROM wbtc_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-01-31'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d ) AS points`
          },
          { method: 'POST' }
        ),
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2 * 3300 AS points, (Extract(epoch FROM (min5_slot - '2024-03-08')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 18) / 5 AS tokens FROM ezeth_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 18) / 5 AS tokens FROM ezeth_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-03-08'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
          },
          { method: 'POST' }
        ),
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2 * 3300 AS points, (Extract(epoch FROM (min5_slot - '2024-03-14')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 18) / 5 AS tokens FROM weeth_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 18) / 5 AS tokens FROM weeth_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-03-14'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
          },
          { method: 'POST' }
        ),
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2 * 3300 AS points, (Extract(epoch FROM (min5_slot - '2024-03-26')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 18) / 5 AS tokens FROM ststone_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 18) / 5 AS tokens FROM ststone_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-03-26'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
          },
          { method: 'POST' }
        ),
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2 * 3300 AS points, (Extract(epoch FROM (min5_slot - '2024-04-18')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 18) / 5 AS tokens FROM wrsteth_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 18) / 5 AS tokens FROM wrsteth_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-04-18'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
          },
          { method: 'POST' }
        ),
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2 * 3300 AS points, (Extract(epoch FROM (min5_slot - '2024-04-23')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 18) / 5 AS tokens FROM weeth_market_new.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 18) / 5 AS tokens FROM weeth_market_new.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-04-23'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
          },
          { method: 'POST' }
        ),
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2 * 52000 AS points, (Extract(epoch FROM (min5_slot - '2024-04-23')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 18) / 5 AS tokens FROM m_btc_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 18) / 5 AS tokens FROM m_btc_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-04-23'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
          },
          { method: 'POST' }
        ),

        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3 * 3300 AS points, (Extract(epoch FROM (min5_slot - '2024-05-07')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 18) / 5 AS tokens FROM ionweth_modenative.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 18) / 5 AS tokens FROM ionweth_modenative.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series('2024-05-07'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
          },
          { method: 'POST' }
        ),
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3 AS points, (Extract(epoch FROM (min5_slot - '2024-05-07')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 6) / 5 AS tokens FROM ionusdt_modenative.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 6) / 5 AS tokens FROM ionusdt_modenative.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series('2024-05-07'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
          },
          { method: 'POST' }
        ),
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3 AS points, (Extract(epoch FROM (min5_slot - '2024-05-07')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 6) / 5 AS tokens FROM ionusdc_modenative.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 6) / 5 AS tokens FROM ionusdc_modenative.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series('2024-05-07'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
          },
          { method: 'POST' }
        ),
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3 * 0.05 AS points, (Extract(epoch FROM (min5_slot - '2024-05-07')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 18) / 5 AS tokens FROM ionmode_modenative.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 18) / 5 AS tokens FROM ionmode_modenative.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series('2024-05-07'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
          },
          { method: 'POST' }
        )
      ]);

      const totalPoints = response.reduce(
        (acc, current) => acc + current.data.rows[0][0],
        0
      );

      return {
        ...response[0].data,
        rows: [[totalPoints]]
      };
    },
    queryKey: ['points', 'supply', address],
    staleTime: Infinity
  });
};

/**
 * Get all borrow points
 */
const usePointsForBorrow = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async () => {
      const response = await Promise.all([
        // WETH
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2800 * 2 AS points, (Extract(epoch FROM (min5_slot - '2024-02-14')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 18) AS tokens FROM weth_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 18) AS tokens FROM weth_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-02-14'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          {
            method: 'POST'
          }
        ),
        // WBTC
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 52000 * 2 AS points, (Extract(epoch FROM (min5_slot - '2024-02-14')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 8) AS tokens FROM wbtc_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 8) AS tokens FROM wbtc_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date AS min5_slot, 0 as tokens FROM generate_series( '2024-02-14'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          {
            method: 'POST'
          }
        ),
        // USDT
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2 AS points, (Extract(epoch FROM (min5_slot - '2024-02-14')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 6) AS tokens FROM usdt_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 6) AS tokens FROM usdt_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date AS min5_slot, 0 as tokens FROM generate_series( '2024-02-14'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          {
            method: 'POST'
          }
        ),
        // USDC
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2 AS points, (Extract(epoch FROM (min5_slot - '2024-02-14')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 6) AS tokens FROM usdc_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 6) AS tokens FROM usdc_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date AS min5_slot, 0 as tokens FROM generate_series( '2024-02-14'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          {
            method: 'POST'
          }
        ),
        // EZETH
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3300 * 2 AS points, (Extract(epoch FROM (min5_slot - '2024-03-08')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 18) AS tokens FROM ezeth_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 18) AS tokens FROM ezeth_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-03-08'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          {
            method: 'POST'
          }
        ),
        // weETH
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3300 * 2 AS points, (Extract(epoch FROM (min5_slot - '2024-03-14')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 18) AS tokens FROM weeth_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 18) AS tokens FROM weeth_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-03-14'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          {
            method: 'POST'
          }
        ),
        // stSTONE
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3300 * 2 AS points, (Extract(epoch FROM (min5_slot - '2024-03-26')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 18) AS tokens FROM ststone_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 18) AS tokens FROM ststone_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-03-26'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          {
            method: 'POST'
          }
        ),
        //wstETH
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3300 * 2 AS points, (Extract(epoch FROM (min5_slot - '2024-04-18')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 18) AS tokens FROM wrsteth_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 18) AS tokens FROM wrsteth_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-04-18'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          { method: 'POST' }
        ),
        //weETHnew
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3300 * 2 AS points, (Extract(epoch FROM (min5_slot - '2024-04-23')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 18) AS tokens FROM weeth_market_new.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 18) AS tokens FROM weeth_market_new.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-04-23'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          { method: 'POST' }
        ),
        // mBTC
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 52000 * 2 AS points, (Extract(epoch FROM (min5_slot - '2024-04-23')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 18) AS tokens FROM m_btc_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 18) AS tokens FROM m_btc_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-04-23'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          { method: 'POST' }
        ),
        // ionWETH
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3 * 3300 AS points, (Extract(epoch FROM (min5_slot - '2024-05-07')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 18) AS tokens FROM ionweth_modenative.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 18) AS tokens FROM ionweth_modenative.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series('2024-05-07'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          { method: 'POST' }
        ),
        // ionUSDC
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3 AS points, (Extract(epoch FROM (min5_slot - '2024-05-07')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 6) AS tokens FROM ionusdc_modenative.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 6) AS tokens FROM ionusdc_modenative.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series('2024-05-07'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          { method: 'POST' }
        ),
        // ionUSDT
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3 * 1 AS points, (Extract(epoch FROM (min5_slot - '2024-05-07')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 6) AS tokens FROM ionusdt_modenative.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 6) AS tokens FROM ionusdt_modenative.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series('2024-05-07'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          { method: 'POST' }
        ),
        // ionMODE
        fetchData<QueryResponse, QueryData>(
          'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
          {
            query: `WITH addr AS (SELECT '${address?.toLowerCase()}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 3 * 0.05 AS points, (Extract(epoch FROM (min5_slot - '2024-05-07')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 18) AS tokens FROM ionmode_modenative.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 18) AS tokens FROM ionmode_modenative.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series('2024-05-07'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
          },
          { method: 'POST' }
        )
      ]);

      const totalPoints = response.reduce(
        (acc, current) => acc + current.data.rows[0][0],
        0
      );

      return {
        ...response[0].data,
        rows: [[totalPoints]]
      };
    },
    queryKey: ['points', 'borrow', address],
    staleTime: Infinity
  });
};

const config = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http() }
});

const useLeaderboard = (page: number) => {
  const pageSize = 50;

  return useQuery({
    cacheTime: Infinity,
    keepPreviousData: true,
    queryFn: async () => {
      const response = await supabase
        .from('ranks')
        .select('*')
        .order('rank', { ascending: true })
        .limit(pageSize)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      // get ENS address
      const data = response.data
        ? await Promise.all(
            response.data.map(async (row) => {
              const ens = await getEnsName(config, {
                address: row.address as Address
              });
              return { ...row, ens };
            })
          )
        : [];

      return data;
    },
    queryKey: ['points', 'leaderboard', page],
    staleTime: Infinity
  });
};

const useGlobalRank = () => {
  const { address } = useMultiIonic();
  return useQuery({
    cacheTime: Infinity,
    queryFn: async () => {
      if (!address) {
        return null;
      }
      const response = await supabase
        .from('ranks')
        .select('*')
        .eq('address', address.toLowerCase())
        .limit(1);

      const highest = await supabase
        .from('ranks')
        .select('*')
        .order('rank', { ascending: false })
        .limit(1);

      return {
        rank: response.data ? response.data[0] : null,
        total: highest.data ? highest.data[0] : null
      };
    },
    queryKey: ['points', 'rank', address],
    staleTime: Infinity
  });
};

export {
  usePointsForSupply,
  usePointsForBorrow,
  useLeaderboard,
  useGlobalRank
};
