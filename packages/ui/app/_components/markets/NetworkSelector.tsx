import React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@ui/components/ui/button';
import { pools } from '@ui/constants/index';
import { useStore } from '@ui/store/Store';

interface INetworkSelector {
  chain?: string;
  dropdownSelectedChain: number;
  nopool?: boolean;
  enabledChains?: number[];
  upcomingChains?: string[];
}

const NETWORK_ORDER = ['Mode', 'Base', 'Optimism', 'Fraxtal', 'Lisk', 'Bob'];

function NetworkSelector({
  dropdownSelectedChain,
  nopool = false,
  enabledChains,
  chain,
  upcomingChains
}: INetworkSelector) {
  const pathname = usePathname();
  const setDropChain = useStore((state) => state.setDropChain);

  const orderedNetworks = NETWORK_ORDER.map((networkName) =>
    Object.entries(pools).find(([_, pool]) => pool.name === networkName)
  ).filter(
    (entry): entry is [string, any] =>
      entry !== undefined &&
      (!enabledChains || enabledChains.includes(+entry[0]))
  );

  return (
    <div className="p-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-wrap gap-2">
        {orderedNetworks.map(([chainId, network], idx) => (
          <Button
            key={idx}
            variant={
              +chainId === +dropdownSelectedChain ? 'secondary' : 'outline'
            }
            size="sm"
            asChild
            className="text-xs md:text-sm"
          >
            <Link
              href={`${pathname}?chain=${chainId}${nopool ? '' : '&pool=0'}`}
              onClick={() => setDropChain(chainId)}
            >
              <Image
                alt={network.name}
                className="w-4 h-4 mr-2"
                src={`/img/logo/${network.name.toUpperCase()}.png`}
                width={16}
                height={16}
              />
              {network.name}
            </Link>
          </Button>
        ))}

        {upcomingChains?.map((upcomingChain, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            className="text-xs md:text-sm relative opacity-50 cursor-not-allowed"
            disabled
          >
            <Image
              alt={upcomingChain}
              className="w-4 h-4 mr-2"
              src={`/img/logo/${upcomingChain.toUpperCase()}.png`}
              width={16}
              height={16}
            />
            {upcomingChain}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(NetworkSelector), { ssr: false });
