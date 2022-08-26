import { useQuery } from 'react-query';

import { useMidas } from '@ui/context/MidasContext';

export function useSupportedUnderlyings() {
  const { midasSdk } = useMidas();

  return useQuery(
    ['SupportedAssets', midasSdk.supportedAssets],
    () =>
      midasSdk.supportedAssets.reduce((arr, asset) => {
        if (!asset.disabled) {
          arr.push(asset.underlying);
        }

        return arr;
      }, [] as string[]),
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!midasSdk.supportedAssets,
    }
  );
}
