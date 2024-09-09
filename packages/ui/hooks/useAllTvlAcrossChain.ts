/* eslint-disable unused-imports/no-unused-imports */
import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';

const supabase = createClient(
  'https://uoagtjstsdrjypxlkuzr.supabase.co/rest/v1/asset-tvl?select=*',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78'
);

export const useAllTvlAcrossChain = () => {
  return useQuery({
    queryKey: ['useAllTvlAcrossChain'],
    queryFn: async () => {
      try {
        const { data } = await supabase.from('asset-tvl').select(`
          chain_id,
          info->>tvlNative`);
        // const { data: all } = await supabase.from('asset-tvl').select('*');

        const total = data?.reduce(
          (acc: number, obj: { chain_id: string; tvlNative: string }) =>
            acc + Number(obj.tvlNative),
          0
        );
        return total;
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
