/* eslint-disable unused-imports/no-unused-imports */
import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';

const supabase = createClient(
  'https://uoagtjstsdrjypxlkuzr.supabase.co/rest/v1/total-asset-tvl?select=*&order=created_at.desc&limit=1',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78'
);

export const useAllTvlAcrossChain = () => {
  return useQuery({
    queryKey: ['useAllTvlAcrossChain'],
    queryFn: async () => {
      try {
        // const { data: other } = await supabase
        //   .from('total-asset-tvl')
        //   .select('*');
        const { data: tvlData } = await supabase
          .from('total-asset-tvl')
          .select('*');

        // const latestData = tvlData?.reduce((acc, item) => {
        //   const chainId = item.chain_id;
        //   const existingItem = acc[chainId];
        //   if (
        //     !existingItem ||
        //     new Date(item.created_at) > new Date(existingItem.created_at)
        //   ) {
        //     acc[chainId] = item;
        //   }

        //   return acc;
        // }, {});

        // const latestTvlData = Object.values(latestData);
        // // //----------------------------
        // if (!latestTvlData) return;
        // const total = latestTvlData?.reduce(
        //   (acc: number, obj: any) => acc + Number(obj.total_tvl_usd),
        //   0
        // );
        return tvlData;

        // return latestTvlData;
        // return data;
        // return total;
        // return [total, all];
      } catch (err) {
        console.warn(err);
      }
      return '';
    },
    gcTime: Infinity,
    enabled: true
  });
};
