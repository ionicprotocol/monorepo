import React from 'react';

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
      {orderedNetworks.map(([chainId, network], idx) => {
        const isSelected = +chainId === +dropdownSelectedChain;

        return (
          <TooltipProvider key={idx}>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant={isSelected ? 'secondary' : 'ghost'}
                    asChild
                    className={`h-9 rounded-md ${isSelected ? 'min-w-[80px] p-2' : 'min-w-[32px] p-1 '}`}
                  >
                    <Link
                      href={getUrlWithParams(chainId)}
                      onClick={() => setDropChain(chainId)}
                      className="flex items-center justify-center gap-2"
                    >
                      <Image
                        alt={network.name}
                        className="w-6 h-6"
                        src={`/img/logo/${network.name.toUpperCase()}.png`}
                        width={24}
                        height={24}
                      />
                      {isSelected && (
                        <span className="text-sm">{network.name}</span>
                      )}
                    </Link>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent className="flex items-center gap-2 bg-background">
                <Image
                  alt={network.name}
                  className="w-4 h-4"
                  src={`/img/logo/${network.name.toUpperCase()}.png`}
                  width={16}
                  height={16}
                />
                <p>{network.name}</p>
                <span className="text-emerald-400 text-xs">Active</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}

      {upcomingChains?.map((upcomingChain, idx) => (
        <TooltipProvider key={idx}>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-8 min-w-[32px] opacity-75 cursor-not-allowed hover:opacity-75"
                  disabled
                >
                  <Image
                    alt={upcomingChain}
                    className="w-6 h-6 grayscale-[30%]"
                    src={`/img/logo/${upcomingChain.toUpperCase()}.png`}
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2 bg-background">
              <Image
                alt={upcomingChain}
                className="w-4 h-4 grayscale-[30%]"
                src={`/img/logo/${upcomingChain.toUpperCase()}.png`}
                width={16}
                height={16}
              />
              <p>{upcomingChain}</p>
              <span className="text-yellow-400 text-xs">Coming Soon</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}

export default NetworkSelector;
