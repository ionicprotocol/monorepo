import React from 'react';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ui/components/ui/select';
import { pools } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

interface NetworkDropdownProps {
  dropdownSelectedChain: number;
  nopool?: boolean;
  enabledChains?: number[];
  upcomingChains?: string[];
}

export default function NetworkDropdown({
  dropdownSelectedChain,
  nopool = false,
  enabledChains,
  upcomingChains
}: NetworkDropdownProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setDropChain } = useMultiIonic();

  const handleValueChange = (value: string) => {
    const chainId = parseInt(value);
    setDropChain(chainId.toString());
    const newUrl = `${pathname}?chain=${chainId}${nopool ? '' : '&pool=0'}`;
    router.push(newUrl);
  };

  return (
    <Select
      value={dropdownSelectedChain.toString()}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="w-[140px] bg-grayUnselect border-white/10 focus:ring-accent">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Image
              alt={pools[dropdownSelectedChain].name}
              className="w-4 h-4"
              src={`/img/logo/${pools[dropdownSelectedChain].name.toUpperCase()}.png`}
              width={16}
              height={16}
            />
            <span className="text-sm">{pools[dropdownSelectedChain].name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-grayUnselect border-white/10">
        {Object.entries(pools)
          .filter(([chainId]) =>
            enabledChains ? enabledChains.includes(+chainId) : true
          )
          .map(([chainId, network]) => (
            <SelectItem
              key={chainId}
              value={chainId}
              className="focus:bg-accent/20 focus:text-white"
            >
              <div className="flex items-center gap-2">
                <Image
                  alt={network.name}
                  className="w-4 h-4"
                  src={`/img/logo/${network.name.toUpperCase()}.png`}
                  width={16}
                  height={16}
                />
                <span className="text-sm">{network.name}</span>
              </div>
            </SelectItem>
          ))}
        {upcomingChains?.map((chain) => (
          <SelectItem
            key={chain}
            value={chain}
            disabled
            className="opacity-50 cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              <Image
                alt={chain}
                className="w-4 h-4"
                src={`/img/logo/${chain.toUpperCase()}.png`}
                width={16}
                height={16}
              />
              <span className="text-sm">{chain}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
