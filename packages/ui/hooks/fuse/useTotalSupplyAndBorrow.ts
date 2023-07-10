import type { MidasSdk } from '@ionicprotocol/sdk';
import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';

export const fetchTotalSupplyAndBorrow = async (midasSdk: MidasSdk) => {
  const { totalSupply, totalBorrow } = await midasSdk.getTotalValueLocked(false);
  const decimals = midasSdk.chainSpecificParams.metadata.wrappedNativeCurrency.decimals;

  return {
    totalBorrow: Number(utils.formatUnits(totalBorrow, decimals)),
    totalSupply: Number(utils.formatUnits(totalSupply, decimals)),
  };
};

type CrossChainTVL = Map<
  string,
  {
    logo: string;
    name: string;
    totalBorrow: number;
    totalSupply: number;
  }
>;

export const useTotalSupplyAndBorrow = () => {
  const { sdks } = useMultiIonic();
  const { data: prices, isLoading, error } = useAllUsdPrices();

  return useQuery<CrossChainTVL | null | undefined>(
    [
      'useTotalSupplyAndBorrow',
      prices && Object.values(prices).sort(),
      isLoading,
      sdks.map((sdk) => sdk.chainId).sort(),
    ],
    async () => {
      if (!isLoading && error) throw new Error('Could not get USD price');
      if (!isLoading && prices) {
        const chainTVLs: CrossChainTVL = new Map();
        await Promise.all(
          sdks.map(async (sdk) => {
            try {
              const { totalSupply, totalBorrow } = await fetchTotalSupplyAndBorrow(sdk);

              chainTVLs.set(sdk.chainId.toString(), {
                logo: sdk.chainSpecificParams.metadata.img,
                name: sdk.chainSpecificParams.metadata.name,
                totalBorrow: totalBorrow * prices[sdk.chainId.toString()].value,
                totalSupply: totalSupply * prices[sdk.chainId.toString()].value,
              });
            } catch (e) {
              console.warn(`Unable to fetch total supply and borrow for chain ${sdk.chainId}`, e);
            }
          })
        );

        const resSorted = new Map(
          [...chainTVLs].sort((a, b) => b[1].totalSupply - a[1].totalSupply)
        );

        return resSorted;
      }

      return null;
    },
    { enabled: !!prices && !isLoading }
  );
};
