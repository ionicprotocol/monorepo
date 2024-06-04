import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { createConfig, getEnsName, http } from '@wagmi/core';
import type { Address } from 'viem';
import { base, mainnet, mode } from 'viem/chains';

import {
  multipliers,
  SEASON_2_BASE_START_DATE,
  SEASON_2_START_DATE
} from '../utils/multipliers';

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

const getSupplyQuery = (
  address: string | undefined,
  ionMultiplier: number,
  marketName: string,
  startDate: string,
  priceMultiplier: number = 1,
  decimals: number = 18
) => {
  return `
  WITH addresses AS (
    SELECT address 
    FROM (VALUES ('${address}')) s(address)
  )
  SELECT 
    address, 
    SUM(points) AS points_per_market 
  FROM (
    SELECT 
      address, 
      date, 
      flow, 
      cum_sum, 
      LAG(cum_sum) OVER (PARTITION BY address ORDER BY address, date) * 
      (EXTRACT(EPOCH FROM delta) / 86400) * ${ionMultiplier} * ${priceMultiplier} AS points 
    FROM (
      SELECT 
        *, 
        SUM(flow) OVER (PARTITION BY address ORDER BY address, date) AS cum_sum, 
        date - LAG(date) OVER (PARTITION BY address ORDER BY address, date) AS delta 
      FROM (
        SELECT 
          address, 
          date, 
          SUM(tokens) AS flow 
        FROM (
          SELECT 
            event_from AS address, 
            DATE_BIN('1 hour', block_time, '2000-1-1') AS date, 
            -event_amount / POW(10, ${decimals}) / 5 AS tokens 
          FROM 
            ${marketName}.transfer_events 
          WHERE 
            event_from IN (SELECT * FROM addresses)
          
          UNION ALL
          
          SELECT 
            event_to AS address, 
            DATE_BIN('1 hour', block_time, '2000-1-1') AS date, 
            event_amount / POW(10, ${decimals}) / 5 AS tokens 
          FROM 
            ${marketName}.transfer_events 
          WHERE 
            event_to IN (SELECT * FROM addresses)
          
          UNION ALL
          
          SELECT 
            address, 
            date, 
            tokens 
          FROM (
            SELECT 
              1 AS a, 
              date_trunc('day', dd)::date AS date, 
              0 AS tokens 
            FROM 
              generate_series('${startDate}'::timestamp, NOW()::timestamp, '1 day'::interval) AS dd
          ) AS a 
          JOIN (
            SELECT 
              1 AS a, 
              address 
            FROM 
              addresses
          ) AS b ON a.a = b.a
          
          UNION ALL
          
          SELECT 
            address, 
            date, 
            tokens 
          FROM (
            SELECT 
              1 AS a, 
              DATE_BIN('1 hour', NOW(), '2000-1-1') AS date, 
              0 AS tokens 
          ) AS a 
          JOIN (
            SELECT 
              1 AS a, 
              address 
            FROM 
              addresses
          ) AS b ON a.a = b.a
        ) AS a 
        GROUP BY 
          address, 
          date 
        ORDER BY 
          address, 
          date
      ) AS b
    ) AS c 
    WHERE 
      date >= '${startDate}T00:00:00'
  ) AS d 
  GROUP BY 
    address
  `;
};

const getBorrowQuery = (
  address: string | undefined,
  ionMultiplier: number,
  marketName: string,
  startDate: string,
  priceMultiplier: number = 1,
  decimals: number = 18
) => {
  return `
  WITH addresses AS (
    SELECT address 
    FROM (VALUES ('${address}')) s(address)
  )
  SELECT 
    address, 
    SUM(CASE WHEN points > 0 THEN points ELSE 0 END) AS points_per_market
  FROM (
    SELECT 
      address, 
      date, 
      flow, 
      cum_sum, 
      LAG(cum_sum) OVER (PARTITION BY address ORDER BY address, date) * 
      (EXTRACT(EPOCH FROM delta) / 86400) * ${ionMultiplier} * ${priceMultiplier} AS points 
    FROM (
      SELECT 
        address, 
        date, 
        flow, 
        SUM(flow) OVER (PARTITION BY address ORDER BY address, date) AS cum_sum, 
        date - LAG(date) OVER (PARTITION BY address ORDER BY address, date) AS delta 
      FROM (
        SELECT 
          address, 
          date, 
          SUM(tokens) AS flow 
        FROM (
          SELECT 
            tx_from AS address, 
            DATE_BIN('1 hour', block_time, '2000-01-01') AS date, 
            -event_repay_amount / POW(10, ${decimals}) AS tokens 
          FROM 
            ${marketName}.repay_borrow_events 
          WHERE 
            event_repay_amount < POW(10, 60) 
            AND tx_from IN (SELECT address FROM addresses)
          
          UNION ALL
          
          SELECT 
            event_borrower AS address, 
            DATE_BIN('1 hour', block_time, '2000-01-01') AS date, 
            event_borrow_amount / POW(10, ${decimals}) AS tokens 
          FROM 
            ${marketName}.borrow_events 
          WHERE 
            event_borrower IN (SELECT address FROM addresses)
          
          UNION ALL
          
          SELECT 
            addr.address, 
            date_series.date, 
            0 AS tokens 
          FROM (
            SELECT 
              1 AS dummy, 
              date_trunc('day', dd)::date AS date 
            FROM 
              generate_series('${startDate}'::timestamp, NOW()::timestamp, '1 day'::interval) AS dd
          ) AS date_series 
          JOIN addresses AS addr ON date_series.dummy = 1
          
          UNION ALL
          
          SELECT 
            addr.address, 
            current_hour.date, 
            0 AS tokens 
          FROM (
            SELECT 
              1 AS dummy, 
              DATE_BIN('1 hour', NOW(), '2000-01-01') AS date 
          ) AS current_hour 
          JOIN addresses AS addr ON current_hour.dummy = 1
        ) AS combined 
        GROUP BY 
          address, 
          date 
        ORDER BY 
          address, 
          date
      ) AS grouped
    ) AS calculated 
    WHERE 
      date >= '${startDate}T00:00:00'
  ) AS final 
  GROUP BY 
    address
  `;
};

/**
 * Get all supply points
 */
const usePointsForSupplyModeMain = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async () => {
      const response = await Promise.all(
        Object.values(multipliers[mode.id]['0']).map((asset) => {
          return fetchData<QueryResponse, QueryData>(
            'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
            {
              query: getSupplyQuery(
                address?.toLowerCase(),
                asset.supply.ionic,
                asset.market,
                SEASON_2_START_DATE,
                asset.multiplier,
                asset.decimals
              )
            },
            {
              method: 'POST'
            }
          );
        })
      );
      const totalPoints = response.reduce(
        (acc, current) => acc + current.data.rows[0][1],
        0
      );

      return {
        ...response[0].data,
        rows: [[totalPoints]]
      };
    },
    queryKey: ['points', 'supply', 'mode-main', address],
    refetchOnWindowFocus: false,
    staleTime: Infinity
  });
};

const usePointsForBorrowModeMain = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async () => {
      const response = await Promise.all(
        Object.values(multipliers[mode.id]['0'])
          .filter((asset) => !!asset.borrow)
          .map((asset) => {
            return fetchData<QueryResponse, QueryData>(
              'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
              {
                query: getBorrowQuery(
                  address?.toLowerCase(),
                  asset.borrow!.ionic,
                  asset.market,
                  SEASON_2_START_DATE,
                  asset.multiplier,
                  asset.decimals
                )
              },
              {
                method: 'POST'
              }
            );
          })
      );
      const totalPoints = response.reduce(
        (acc, current) => acc + current.data.rows[0][1],
        0
      );

      return {
        ...response[0].data,
        rows: [[totalPoints]]
      };
    },
    queryKey: ['points', 'borrow', 'mode-main', address],
    refetchOnWindowFocus: false,
    staleTime: Infinity
  });
};

const usePointsForSupplyModeNative = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async () => {
      const response = await Promise.all(
        Object.values(multipliers[mode.id]['1']).map((asset) => {
          return fetchData<QueryResponse, QueryData>(
            'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
            {
              query: getSupplyQuery(
                address?.toLowerCase(),
                asset.supply.ionic,
                asset.market,
                SEASON_2_START_DATE,
                asset.multiplier,
                asset.decimals
              )
            },
            {
              method: 'POST'
            }
          );
        })
      );
      const totalPoints = response.reduce(
        (acc, current) => acc + current.data.rows[0][1],
        0
      );

      return {
        ...response[0].data,
        rows: [[totalPoints]]
      };
    },
    queryKey: ['points', 'supply', 'mode-native', address],
    refetchOnWindowFocus: false,
    staleTime: Infinity
  });
};

const usePointsForBorrowModeNative = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async () => {
      const response = await Promise.all(
        Object.values(multipliers[mode.id]['1'])
          .filter((asset) => !!asset.borrow)
          .map((asset) => {
            return fetchData<QueryResponse, QueryData>(
              'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
              {
                query: getBorrowQuery(
                  address?.toLowerCase(),
                  asset.borrow!.ionic,
                  asset.market,
                  SEASON_2_START_DATE,
                  asset.multiplier,
                  asset.decimals
                )
              },
              {
                method: 'POST'
              }
            );
          })
      );
      const totalPoints = response.reduce(
        (acc, current) => acc + current.data.rows[0][1],
        0
      );

      return {
        ...response[0].data,
        rows: [[totalPoints]]
      };
    },
    queryKey: ['points', 'borrow', 'mode-native', address],
    refetchOnWindowFocus: false,
    staleTime: Infinity
  });
};

const usePointsForSupplyBaseMain = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async () => {
      const response = await Promise.all(
        Object.values(multipliers[base.id]['0']).map((asset) => {
          return fetchData<QueryResponse, QueryData>(
            'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
            {
              query: getSupplyQuery(
                address?.toLowerCase(),
                asset.supply.ionic,
                asset.market,
                SEASON_2_BASE_START_DATE,
                asset.multiplier,
                asset.decimals
              )
            },
            {
              method: 'POST'
            }
          );
        })
      );
      const totalPoints = response.reduce(
        (acc, current) => acc + current.data.rows[0][1],
        0
      );

      return {
        ...response[0].data,
        rows: [[totalPoints]]
      };
    },
    queryKey: ['points', 'supply', 'base-main', address],
    refetchOnWindowFocus: false,
    staleTime: Infinity
  });
};

const usePointsForBorrowBaseMain = () => {
  const { address } = useMultiIonic();

  return useQuery({
    cacheTime: Infinity,
    queryFn: async () => {
      const response = await Promise.all(
        Object.values(multipliers[base.id]['0'])
          .filter((asset) => !!asset.borrow)
          .map((asset) => {
            return fetchData<QueryResponse, QueryData>(
              'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
              {
                query: getBorrowQuery(
                  address?.toLowerCase(),
                  asset.borrow!.ionic,
                  asset.market,
                  SEASON_2_BASE_START_DATE,
                  asset.multiplier,
                  asset.decimals
                )
              },
              {
                method: 'POST'
              }
            );
          })
      );
      const totalPoints = response.reduce(
        (acc, current) => acc + current.data.rows[0][1],
        0
      );

      return {
        ...response[0].data,
        rows: [[totalPoints]]
      };
    },
    queryKey: ['points', 'borrow', 'base-main', address],
    refetchOnWindowFocus: false,
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
        .from('ranks_season2')
        .select('*')
        .order('rank', { ascending: true })
        .limit(pageSize)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      // get ENS address
      const data = response.data
        ? await Promise.all(
            response.data.map(async (row) => {
              const ens = await getEnsName(config, {
                address: row.address as Address,
                chainId: config.chains[0].id
              });
              return { ...row, ens };
            })
          )
        : [];

      return data;
    },
    queryKey: ['points', 'leaderboard', page],
    refetchOnWindowFocus: false,
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
        .from('ranks_season2')
        .select('*')
        .eq('address', address.toLowerCase())
        .limit(1);

      const highest = await supabase
        .from('ranks_season2')
        .select('*')
        .order('rank', { ascending: false })
        .limit(1);

      return {
        rank: response.data ? response.data[0] : null,
        total: highest.data ? highest.data[0] : null
      };
    },
    queryKey: ['points', 'rank', address],
    refetchOnWindowFocus: false,
    staleTime: Infinity
  });
};

export {
  usePointsForSupplyBaseMain,
  usePointsForSupplyModeMain,
  usePointsForSupplyModeNative,
  usePointsForBorrowBaseMain,
  usePointsForBorrowModeMain,
  usePointsForBorrowModeNative,
  useLeaderboard,
  useGlobalRank
};
