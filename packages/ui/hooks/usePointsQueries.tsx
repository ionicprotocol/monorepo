import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { fetchData } from '@ui/utils/functions';

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
      const response = await fetchData<QueryResponse, QueryData>(
        'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
        {
          query: `WITH addr AS (SELECT '${address}') SELECT sum(total_points) FROM ( SELECT sum(points) AS total_points FROM ( SELECT min5_slot, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2300 AS points FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM (SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 18) / 5 AS tokens FROM weth_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 18) / 5 AS tokens FROM weth_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d UNION ALL SELECT sum(points) AS total_points FROM ( SELECT min5_slot, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 43000 AS points FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM (SELECT min5_slot, Sum(wbtc) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 8) / 5 AS wbtc FROM wbtc_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 8) / 5 AS wbtc FROM wbtc_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS wbtc ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d UNION ALL SELECT sum(points) AS total_points FROM ( SELECT min5_slot, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) AS points FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM (SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 6) / 5 AS tokens FROM usdc_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 6) / 5 AS tokens FROM usdc_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d UNION ALL SELECT sum(points) AS total_points FROM ( SELECT min5_slot, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 1 AS points FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM (SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 6) / 5 AS tokens FROM usdt_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 6) / 5 AS tokens FROM usdt_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d ) AS e`
        },
        {
          method: 'POST'
        }
      );

      return response.data;
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
      const response = await fetchData<QueryResponse, QueryData>(
        'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
        {
          query: `WITH addr AS (SELECT '${address}') SELECT sum(total_points) FROM ( SELECT sum(points) AS total_points FROM ( SELECT min5_slot, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2300 AS points FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM (SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 18) AS tokens FROM weth_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 18) AS tokens FROM weth_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d UNION ALL SELECT sum(points) AS total_points FROM ( SELECT min5_slot, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 43000 AS points FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM (SELECT min5_slot, Sum(wbtc) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 8) AS wbtc FROM wbtc_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 8) AS wbtc FROM wbtc_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS wbtc ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d UNION ALL SELECT sum(points) AS total_points FROM ( SELECT min5_slot, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) AS points FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM (SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 6) AS tokens FROM usdc_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 6) AS tokens FROM usdc_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d UNION ALL SELECT sum(points) AS total_points FROM ( SELECT min5_slot, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 1 AS points FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM (SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 6) AS tokens FROM usdt_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 6) AS tokens FROM usdt_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d ) AS e`
        },
        {
          method: 'POST'
        }
      );

      return response.data;
    },
    queryKey: ['points', 'borrow', address],
    staleTime: Infinity
  });
};

export { usePointsForSupply, usePointsForBorrow };
