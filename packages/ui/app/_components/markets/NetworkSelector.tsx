import React from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { Button } from '@ui/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@ui/components/ui/tooltip';
import { pools } from '@ui/constants/index';
import { useStore } from '@ui/store/Store';

interface INetworkSelector {
  dropdownSelectedChain: number;
  nopool?: boolean;
  enabledChains?: number[];
  upcomingChains?: string[];
}

const NETWORK_ORDER = ['Mode', 'Base', 'Optimism', 'Fraxtal', 'Lisk', 'BoB'];

function NetworkSelector({
  dropdownSelectedChain,
  nopool = false,
  enabledChains,
  upcomingChains
}: INetworkSelector) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setDropChain = useStore((state) => state.setDropChain);

  const orderedNetworks = NETWORK_ORDER.map((networkName) =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(pools).find(([_, pool]) => pool.name === networkName)
  ).filter(
    (entry): entry is [string, any] =>
      entry !== undefined &&
      (!enabledChains || enabledChains.includes(+entry[0]))
  );

  const getUrlWithParams = (chainId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('chain', chainId);

    if (!nopool && !params.has('pool')) {
      params.set('pool', '0');
    }
    if (nopool && params.has('pool')) {
      params.delete('pool');
    }

    return `${pathname}?${params.toString()}`;
  };

  return (
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
            href={getUrlWithParams(chainId)}
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
        <TooltipProvider key={idx}>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs md:text-sm relative opacity-50 cursor-not-allowed bg-gray-800"
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
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Coming soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}

export default dynamic(() => Promise.resolve(NetworkSelector), { ssr: false });
