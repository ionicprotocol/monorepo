import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { Globe, Diamond, Wallet } from 'lucide-react';

import { pools } from '@ui/constants/index';

const PoolToggle = ({ chain, pool }: { chain: number; pool: string }) => {
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

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {poolsData.length > 0 && (
        <div className="h-9 rounded-lg bg-darktwo border border-white/10 p-0.5">
          <div className="inline-flex items-center h-full gap-1">
            {poolsData.map((poolConfig, idx) => {
              const isActive = pool === poolConfig.id;
              const isMain = poolConfig.name.toLowerCase().includes('main');

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
                  {isMain ? (
                    <Globe className="h-4 w-4" />
                  ) : (
                    <Diamond className="h-4 w-4" />
                  )}
                  <span className="relative whitespace-nowrap">
                    {isMain ? 'Main' : 'Native'}
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
