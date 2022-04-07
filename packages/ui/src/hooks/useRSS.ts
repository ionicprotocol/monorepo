import { FusePoolData } from '@midas-capital/sdk';
import axios from 'axios';
import { Contract } from 'ethers';
import { useQuery } from 'react-query';

import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';

export const letterScore = (totalScore: number) => {
  // if (totalScore >= 95) {
  //   return "A++";
  // }
  //
  // if (totalScore >= 90) {
  //   return "A+";
  // }

  if (totalScore >= 80) {
    return 'A';
  }

  // if (totalScore >= 70) {
  //   return "A-";
  // }

  if (totalScore >= 60) {
    return 'B';
  }

  if (totalScore >= 50) {
    return 'C';
  }

  if (totalScore >= 40) {
    return 'D';
  }

  if (totalScore >= 30) {
    return 'F';
  } else {
    return 'UNSAFE';
  }
};

export const usePoolRSS = (poolId: string | number) => {
  const { fuse, currentChain, address } = useRari();

  const { data } = useQuery(
    [`PoolRSS`, currentChain.id, poolId],
    async () => {
      try {
        const poolData = (await fuse.fetchFusePoolData(
          String(poolId),
          address,
          NATIVE_TOKEN_DATA[fuse.chainId].coingeckoId
        )) as FusePoolData;
        const { 0: admin, 1: upgradeable } =
          await fuse.contracts.FusePoolLensSecondary.callStatic.getPoolOwnership(
            poolData.comptroller
          );
        const contract = new Contract(
          poolData.comptroller,
          fuse.chainDeployment.Comptroller.abi,
          fuse.provider.getSigner()
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
        // const res = await axios.post('/api/rss', {
        //   poolId: poolId.toString(),
        //   chainId,
        //   userAddress: address,
        //   poolData,
        // });
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
      } catch (e) {
        console.log('Could not fetch RSS!');
        console.log(e);
      }
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // 1 day
      cacheTime: 8.64e7,
    }
  );

  return data;
};
