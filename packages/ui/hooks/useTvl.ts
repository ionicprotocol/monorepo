import { useQuery } from '@tanstack/react-query';
import { formatEther } from 'viem';
import { base, mode } from 'viem/chains';
import { useReadContracts } from 'wagmi';

import { TradingAbi } from '@ui/constants/modetradingfees';
import { useIonPrice, useTokenPrice } from '@ui/hooks/useDexScreenerPrices';

import { useUsdPrice } from './useUsdPrices';

interface IuseTvl {
  poolAddress: `0x${string}`;
  poolChainId?: number;
  assets: string[];
}

export const useTvl = ({
  poolAddress,
  poolChainId = 34443,
  assets = ['ION', 'WETH']
}: IuseTvl) => {
  const { data: reserves, isPending } = useReadContracts({
    contracts: [
      {
        abi: TradingAbi,
        address: poolAddress,
        args: [],
        functionName: 'reserve0',
        chainId: poolChainId
      },
      {
        abi: TradingAbi,
        address: poolAddress,
        args: [],
        functionName: 'reserve1',
        chainId: poolChainId
      }
    ]
  }) as any;

  const { data: ionData } = useIonPrice({
    chainId: base.id
  });

  const { data: ethPrice } = useUsdPrice(poolChainId);
  const { data: modePriceData } = useTokenPrice(mode.id);

  return useQuery({
    queryKey: ['useTvl', ionData, ethPrice, reserves, isPending],
    queryFn: () => {
      if (!ionData && !ethPrice && isPending && !reserves) return;

      const token2resrv =
        Number(formatEther(reserves[1]?.result ?? BigInt(0))) ?? 0;
      const ionreserves =
        Number(formatEther(reserves[0]?.result ?? BigInt(0))) ?? 0;

      const token2 =
        assets[1] === 'MODE'
          ? Number(modePriceData?.pair.priceUsd) * token2resrv
          : Number(ethPrice) * token2resrv;

      const ion = Number(ionData?.pair.priceUsd) * ionreserves;

      return [ion, token2];
    },
    enabled: !!ionData && !!ethPrice && !!reserves && !!ionData
  });
};
