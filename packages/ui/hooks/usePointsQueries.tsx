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
 * Get weth supply points
 */
export const useSupplyPointsForWeth = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async (): Promise<number> => {
      const wethData = await fetchData<QueryResponse, QueryData>(
        'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
        {
          query: `WITH addr AS (SELECT '${'0x66f2e146ad18b761a6be38e6f427b7899be8ef90'}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2800 AS points, (Extract(epoch FROM (min5_slot - '2024-01-31')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 18) / 5 AS tokens FROM weth_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 18) / 5 AS tokens FROM weth_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-01-31'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
        },
        {
          method: 'POST'
        }
      );

      return Math.round(
        wethData.data.rows.reduce(
          (rowsAccumulator, rowsCurrent) =>
            rowsAccumulator +
            rowsCurrent.reduce(
              (innerAccumulator, innerCurrent) =>
                innerAccumulator + innerCurrent,
              0
            ),
          0
        )
      );
    },
    queryKey: ['points', 'supply', 'weth', address]
  });
};

/**
 * Get usdt supply points
 */
export const useSupplyPointsForUsdt = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async (): Promise<number> => {
      const usdtData = await fetchData<QueryResponse, QueryData>(
        'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
        {
          query: `WITH addr AS (SELECT '${'0x66f2e146ad18b761a6be38e6f427b7899be8ef90'}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) AS points, (Extract(epoch FROM (min5_slot - '2024-01-31')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 6) / 5 AS tokens FROM usdt_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 6) / 5 AS tokens FROM usdt_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-01-31'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
        },
        {
          method: 'POST'
        }
      );

      return Math.round(
        usdtData.data.rows.reduce(
          (rowsAccumulator, rowsCurrent) =>
            rowsAccumulator +
            rowsCurrent.reduce(
              (innerAccumulator, innerCurrent) =>
                innerAccumulator + innerCurrent,
              0
            ),
          0
        )
      );
    },
    queryKey: ['points', 'supply', 'usdt', address]
  });
};

/**
 * Get usdc supply points
 */
export const useSupplyPointsForUsdc = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async (): Promise<number> => {
      const usdcData = await fetchData<QueryResponse, QueryData>(
        'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
        {
          query: `WITH addr AS (SELECT '${'0x66f2e146ad18b761a6be38e6f427b7899be8ef90'}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) AS points, (Extract(epoch FROM (min5_slot - '2024-01-31')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 6) / 5 AS tokens FROM usdc_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 6) / 5 AS tokens FROM usdc_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-01-31'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
        },
        {
          method: 'POST'
        }
      );

      return Math.round(
        usdcData.data.rows.reduce(
          (rowsAccumulator, rowsCurrent) =>
            rowsAccumulator +
            rowsCurrent.reduce(
              (innerAccumulator, innerCurrent) =>
                innerAccumulator + innerCurrent,
              0
            ),
          0
        )
      );
    },
    queryKey: ['points', 'supply', 'usdc', address]
  });
};

/**
 * Get wbtc supply points
 */
export const useSupplyPointsForWbtc = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async (): Promise<number> => {
      const wbtcData = await fetchData<QueryResponse, QueryData>(
        'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
        {
          query: `WITH addr AS (SELECT '${'0x66f2e146ad18b761a6be38e6f427b7899be8ef90'}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 52000 AS points, (Extract(epoch FROM (min5_slot - '2024-01-31')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -event_amount / Pow(10, 8) / 5 AS tokens FROM wbtc_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_amount / Pow(10, 8) / 5 AS tokens FROM wbtc_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-01-31'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c) AS d`
        },
        {
          method: 'POST'
        }
      );

      return Math.round(
        wbtcData.data.rows.reduce(
          (rowsAccumulator, rowsCurrent) =>
            rowsAccumulator +
            rowsCurrent.reduce(
              (innerAccumulator, innerCurrent) =>
                innerAccumulator + innerCurrent,
              0
            ),
          0
        )
      );
    },
    queryKey: ['points', 'supply', 'wbtc', address]
  });
};

/**
 * Get all supply points
 */
export const usePointsForSupply = () => {
  const { address } = useMultiIonic();
  const { data: wethData } = useSupplyPointsForWeth();
  const { data: usdtData } = useSupplyPointsForUsdt();
  const { data: usdcData } = useSupplyPointsForUsdc();
  const { data: wbtcData } = useSupplyPointsForWbtc();

  return useQuery({
    cacheTime: Infinity,
    enabled:
      wethData !== undefined &&
      usdtData !== undefined &&
      usdcData !== undefined &&
      wbtcData !== undefined,
    queryFn: (): number => {
      if (
        wethData === undefined ||
        usdtData === undefined ||
        usdcData === undefined ||
        wbtcData === undefined
      ) {
        return 0;
      }

      const data = [wethData, usdtData, usdcData, wbtcData];
      const calculatedPoints = data.reduce((acc, current) => acc + current, 0);

      return Math.round(calculatedPoints);
    },
    queryKey: ['points', 'supply', address],
    staleTime: Infinity
  });
};

/**
 * Get weth borrow points
 */
export const useBorrowPointsForWeth = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async (): Promise<number> => {
      const wethData = await fetchData<QueryResponse, QueryData>(
        'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
        {
          query: `WITH addr AS (SELECT '${'0x66f2e146ad18b761a6be38e6f427b7899be8ef90'}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 2800 AS points, (Extract(epoch FROM (min5_slot - '2024-02-14')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 18) AS tokens FROM weth_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 18) AS tokens FROM weth_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date, 0 as tokens FROM generate_series( '2024-02-14'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
        },
        {
          method: 'POST'
        }
      );

      return Math.round(
        wethData.data.rows.reduce(
          (rowsAccumulator, rowsCurrent) =>
            rowsAccumulator +
            rowsCurrent.reduce(
              (innerAccumulator, innerCurrent) =>
                innerAccumulator + innerCurrent,
              0
            ),
          0
        )
      );
    },
    queryKey: ['points', 'borrow', 'weth', address]
  });
};

/**
 * Get usdt borrow points
 */
export const useBorrowPointsForUsdt = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async (): Promise<number> => {
      const usdtData = await fetchData<QueryResponse, QueryData>(
        'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
        {
          query: `WITH addr AS (SELECT '${'0x66f2e146ad18b761a6be38e6f427b7899be8ef90'}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) AS points, (Extract(epoch FROM (min5_slot - '2024-02-14')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 6) AS tokens FROM usdt_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 6) AS tokens FROM usdt_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date AS min5_slot, 0 as tokens FROM generate_series( '2024-02-14'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
        },
        {
          method: 'POST'
        }
      );

      return Math.round(
        usdtData.data.rows.reduce(
          (rowsAccumulator, rowsCurrent) =>
            rowsAccumulator +
            rowsCurrent.reduce(
              (innerAccumulator, innerCurrent) =>
                innerAccumulator + innerCurrent,
              0
            ),
          0
        )
      );
    },
    queryKey: ['points', 'borrow', 'usdt', address]
  });
};

/**
 * Get usdc borrow points
 */
export const useBorrowPointsForUsdc = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async (): Promise<number> => {
      const usdcData = await fetchData<QueryResponse, QueryData>(
        'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
        {
          query: `WITH addr AS (SELECT '${'0x66f2e146ad18b761a6be38e6f427b7899be8ef90'}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) AS points, (Extract(epoch FROM (min5_slot - '2024-02-14')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 6) AS tokens FROM usdc_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 6) AS tokens FROM usdc_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date AS min5_slot, 0 as tokens FROM generate_series( '2024-02-14'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
        },
        {
          method: 'POST'
        }
      );

      return Math.round(
        usdcData.data.rows.reduce(
          (rowsAccumulator, rowsCurrent) =>
            rowsAccumulator +
            rowsCurrent.reduce(
              (innerAccumulator, innerCurrent) =>
                innerAccumulator + innerCurrent,
              0
            ),
          0
        )
      );
    },
    queryKey: ['points', 'borrow', 'usdc', address]
  });
};

/**
 * Get wbtc borrow points
 */
export const useBorrowPointsForWbtc = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async (): Promise<number> => {
      const wbtcData = await fetchData<QueryResponse, QueryData>(
        'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
        {
          query: `WITH addr AS (SELECT '${'0x66f2e146ad18b761a6be38e6f427b7899be8ef90'}') SELECT SUM(points * (-ln(days+1)+5.5)) AS total_points FROM ( SELECT min5_slot, flow, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 52000 AS points, (Extract(epoch FROM (min5_slot - '2024-02-14')) / 86400) AS days FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM ( SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , -method_repay_amount / Pow(10, 8) AS tokens FROM wbtc_market.repay_borrow_methods WHERE method_repay_amount<pow(10,60) AND tx_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('1 hour', block_time, '2000-1-1') AS min5_slot , event_borrow_amount / Pow(10, 8) AS tokens FROM wbtc_market.borrow_events WHERE event_borrower IN (SELECT * FROM addr) UNION ALL SELECT date_trunc('day', dd):: date AS min5_slot, 0 as tokens FROM generate_series( '2024-02-14'::timestamp, NOW()::timestamp, '1 day'::interval) dd UNION ALL SELECT Date_bin ('1 hour', NOW(), '2000-1-1') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
        },
        {
          method: 'POST'
        }
      );

      return Math.round(
        wbtcData.data.rows.reduce(
          (rowsAccumulator, rowsCurrent) =>
            rowsAccumulator +
            rowsCurrent.reduce(
              (innerAccumulator, innerCurrent) =>
                innerAccumulator + innerCurrent,
              0
            ),
          0
        )
      );
    },
    queryKey: ['points', 'borrow', 'wbtc', address]
  });
};

/**
 * Get all borrow points
 */
export const usePointsForBorrow = () => {
  const { address } = useMultiIonic();
  const { data: wethData } = useBorrowPointsForWeth();
  const { data: usdtData } = useBorrowPointsForUsdt();
  const { data: usdcData } = useBorrowPointsForUsdc();
  const { data: wbtcData } = useBorrowPointsForWbtc();

  return useQuery({
    cacheTime: Infinity,
    enabled:
      wethData !== undefined &&
      usdtData !== undefined &&
      usdcData !== undefined &&
      wbtcData !== undefined,
    queryFn: (): number => {
      if (
        wethData === undefined ||
        usdtData === undefined ||
        usdcData === undefined ||
        wbtcData === undefined
      ) {
        return 0;
      }

      const data = [wethData, usdtData, usdcData, wbtcData];
      const calculatedPoints = data.reduce((acc, current) => acc + current, 0);

      return Math.round(calculatedPoints);
    },
    queryKey: ['points', 'borrow', address],
    staleTime: Infinity
  });
};
