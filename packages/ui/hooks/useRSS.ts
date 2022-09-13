import { Web3Provider } from '@ethersproject/providers';
import axios from 'axios';
import { Contract } from 'ethers';
import { useQuery } from '@tanstack/react-query';

import { useMidas } from '@ui/context/MidasContext';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

export const letterScore = (totalScore: number) => {
  // if (totalScore >= 95) return 'A++';
  // if (totalScore >= 90) return 'A+';
  if (totalScore >= 80) return 'A';
  // if (totalScore >= 70)  return "A-";
  if (totalScore >= 60) return 'B';
  if (totalScore >= 50) return 'C';
  if (totalScore >= 40) return 'D';
  if (totalScore >= 30) return 'F';

  return 'UNSAFE';
};

// TODO REWORK
// duplicated code from useFusePoolData and it's not even needed!!
// RSS should be able to be calculated completely in the backend.
// Quite ridiculous to fetch usd prices and pool data in frontend to just pass it to the backend...

export const usePoolRSS = (poolId: string | number) => {
  const { midasSdk, currentChain, coingeckoId } = useMidas();
  const { data: usdPrice } = useUSDPrice(coingeckoId);
  const { data: poolData } = useFusePoolData(poolId.toString());

  return useQuery(
    [`usePoolRSS`, currentChain.id, poolId],
    async () => {
      if (!usdPrice || !poolData) return undefined;

      const { 0: admin, 1: upgradeable } =
        await midasSdk.contracts.FusePoolLensSecondary.callStatic.getPoolOwnership(
          poolData.comptroller
        );
      const contract = new Contract(
        poolData.comptroller,
        midasSdk.chainDeployment.Comptroller.abi,
        midasSdk.provider as Web3Provider
      );
      const liquidationIncentiveMantissa = await contract.liquidationIncentiveMantissa();
      const res = await axios.post('/api/rss', {
        poolId: poolId.toString(),
        chainId: currentChain.id,
        poolData,
        admin,
        upgradeable,
        liquidationIncentiveMantissa,
      });

      return res.data as {
        liquidity: number;
        collateralFactor: number;
        reserveFactor: number;
        utilization: number;
        averageRSS: number;
        upgradeable: number;
        mustPass: number;
        totalScore: number;
        lastUpdated: string;
      };
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // 1 day
      cacheTime: 8.64e7,
    }
  );
};
