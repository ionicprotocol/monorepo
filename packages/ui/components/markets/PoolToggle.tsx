'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { Globe, Diamond, Wallet } from 'lucide-react';

import { pools } from '@ui/constants/index';

interface HiddenPool {
  chainId: number;
  poolId: string;
}

interface PoolToggleProps {
  chain: number;
  pool: string;
  hiddenPools?: HiddenPool[];
}

const PoolToggle = ({ chain, pool, hiddenPools = [] }: PoolToggleProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chainConfig = pools[+chain];
  const poolsData = chainConfig.pools;
  const vaultsData = chainConfig.vaults;

  const getUpdatedUrl = (newPool: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('chain', chain.toString());
    if (newPool) {
      params.set('pool', newPool);
    }
    return `${pathname}?${params.toString()}`;
  };

  const filteredPoolsData = poolsData
    .filter((poolConfig) => {
      return !hiddenPools.some(
        (hiddenPool) =>
          hiddenPool.chainId === chain && hiddenPool.poolId === poolConfig.id
      );
    })
    .sort((a, b) => {
      const aIsDeprecated = a.name.toLowerCase().includes('deprecated');
      const bIsDeprecated = b.name.toLowerCase().includes('deprecated');

      if (aIsDeprecated && !bIsDeprecated) return 1;
      if (!aIsDeprecated && bIsDeprecated) return -1;
      return 0;
    });

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {filteredPoolsData.length > 0 && (
        <div className="h-9 rounded-lg bg-darktwo border border-white/10 p-0.5">
          <div className="inline-flex items-center h-full gap-1">
            {filteredPoolsData.map((poolConfig, idx) => {
              const isActive = pool === poolConfig.id;
              const isNative = poolConfig.name.toLowerCase().includes('native');
              const isDeprecated = poolConfig.name
                .toLowerCase()
                .includes('deprecated');

              return (
                <Link
                  key={idx}
                  href={getUpdatedUrl(poolConfig.id)}
                  className={`
                    inline-flex items-center gap-2 px-3 h-full rounded-md text-sm font-medium transition-all
                    ${
                      isActive
                        ? `${chainConfig.bg} ${chainConfig.text}`
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {isNative ? (
                    <Diamond className="h-4 w-4" />
                  ) : isDeprecated ? (
                    <img
                      className="h-4 w-4 rounded-full"
                      src="https://media.istockphoto.com/id/1913564962/de/vektor/nordkoreas-kreisflagge-schaltfl%C3%A4chen-flaggensymbol-standardfarbe-kreissymbol-flagge-computer.jpg?s=612x612&w=0&k=20&c=jgpP_sfyWiWBblsNszRatxff7Ps2n2TMOi2rqBk8TZs="
                      alt="Deprecated Pool"
                    />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  <span className="relative whitespace-nowrap">
                    {isDeprecated ? 'Deprecated' : isNative ? 'Native' : 'Main'}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {vaultsData && vaultsData.length > 0 && (
        <div className="h-9 rounded-lg bg-darktwo border border-white/10 p-0.5">
          <Link
            href={getUpdatedUrl('vault')}
            className={`
              inline-flex items-center gap-2 px-3 h-full rounded-md text-sm font-medium transition-all
              ${
                pool === 'vault'
                  ? `${chainConfig.bg} ${chainConfig.text}`
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <Wallet className="h-4 w-4" />
            <span className="whitespace-nowrap">
              {vaultsData[0]?.name || 'Supply Vault'}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(PoolToggle), { ssr: false });
