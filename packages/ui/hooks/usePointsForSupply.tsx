import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiIonicContext';
import { fetchData } from '@ui/utils/functions';

const usePointsForSupply = () => {
  const { address } = useMultiMidas();

  return useQuery({
    queryFn: async () => {
      const data = await fetchData(
        'https://api.unmarshal.com/v1/parser/a640fbce-88bd-49ee-94f7-3239c6118099/execute?auth_key=IOletSNhbw4BWvzhlu7dy6YrQyFCnad8Lv8lnyEe',
        {
          query: `WITH addr AS (SELECT '''${address}''') SELECT sum(points) AS total_usdt_points FROM ( SELECT min5_slot, cum_sum, Lag(cum_sum) OVER (ORDER BY min5_slot) * (SELECT Extract(epoch FROM delta) / 86400) * 1 AS points FROM ( SELECT min5_slot, flow, Sum(flow) OVER ( ORDER BY min5_slot) AS cum_sum, min5_slot - Lag(min5_slot) OVER ( ORDER BY min5_slot) AS delta FROM (SELECT min5_slot, Sum(tokens) AS flow FROM (SELECT Date_bin ('''1 hour''', block_time, '''2000-1-1''') AS min5_slot , -event_amount / Pow(10, 6) / 5 AS tokens FROM usdt_market.transfer_events WHERE event_from IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('''1 hour''', block_time, '''2000-1-1''') AS min5_slot , event_amount / Pow(10, 6) / 5 AS tokens FROM usdt_market.transfer_events WHERE event_to IN (SELECT * FROM addr) UNION ALL SELECT Date_bin ('''1 hour''', NOW(), '''2000-1-1''') AS min5_slot, 0 AS tokens ) AS a GROUP BY min5_slot ORDER BY min5_slot) AS b) AS c ) AS d`
        },
        {
          method: 'POST'
        }
      );

      return data;
    },
    queryKey: ['points', 'supply']
  });
};

export default usePointsForSupply;
