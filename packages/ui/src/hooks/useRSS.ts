import { FusePoolData, NativePricedFuseAsset } from '@midas-capital/sdk';
import axios from 'axios';
import { Contract } from 'ethers';
import { useQuery } from 'react-query';

import { useUSDPrice } from './useUSDPrice';

import { useRari } from '@ui/context/RariContext';

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

export const usePoolRSS = (poolId: string | number) => {
  const { fuse, currentChain, address, coingeckoId } = useRari();
  const { data: usdPrice } = useUSDPrice(coingeckoId);

  return useQuery(
    [`usePoolRSS`, currentChain.id, poolId, usdPrice],
    async () => {
      if (!usdPrice) return undefined;

      const resp = (await fuse.fetchFusePoolData(String(poolId), address)) as FusePoolData;

      const assetsWithPrice: NativePricedFuseAsset[] = [];
      if (resp.assets && resp.assets.length !== 0) {
        resp.assets.map((asset) => {
          assetsWithPrice.push({
            ...asset,
            supplyBalanceNative: asset.supplyBalanceNative * usdPrice,
            borrowBalanceNative: asset.borrowBalanceNative * usdPrice,
            totalSupplyNative: asset.totalSupplyNative * usdPrice,
            totalBorrowNative: asset.totalBorrowNative * usdPrice,
            liquidityNative: asset.liquidityNative * usdPrice,
          });
        });
      }

      const poolData: FusePoolData = {
        ...resp,
        assets: assetsWithPrice,
        totalLiquidityNative: resp.totalLiquidityNative * usdPrice,
        totalSuppliedNative: resp.totalSuppliedNative * usdPrice,
        totalBorrowedNative: resp.totalBorrowedNative * usdPrice,
        totalSupplyBalanceNative: resp.totalSupplyBalanceNative * usdPrice,
        totalBorrowBalanceNative: resp.totalBorrowBalanceNative * usdPrice,
      };

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
