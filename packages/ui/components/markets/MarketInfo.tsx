import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowRight } from 'lucide-react';
import { base, mode, optimism } from 'viem/chains';

import { Button } from '@ui/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import { Separator } from '@ui/components/ui/separator';
import useSugarAPR from '@ui/hooks/useSugarAPR';
import type { PoolData } from '@ui/types/TokensDataMap';

import WrapWidget from './WrapWidget';
import { CHAIN_CONFIGS } from '../stake/RewardDisplay';

interface MarketInfoProps {
  chain: number;
  poolData?: PoolData | null;
  isLoadingPoolData: boolean;
  isLoadingLoopMarkets: boolean;
}

const MarketInfo = ({
  chain,
  poolData,
  isLoadingPoolData,
  isLoadingLoopMarkets
}: MarketInfoProps) => {
  const chainConfig = CHAIN_CONFIGS[chain]?.defaultConfig;
  const { apr } = useSugarAPR({
    sugarAddress: chainConfig?.sugarAddress ?? '0x',
    poolIndex: chainConfig?.poolIndex ?? 0n,
    chainId: chain,
    selectedToken: 'eth',
    isMode: chain === mode.id
  });

  const [wrapWidgetOpen, setWrapWidgetOpen] = useState<boolean>(false);
  const formatCurrency = (value?: number) => {
    if (value === undefined) {
      return '$0.00';
    }
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else {
      return `$${value.toLocaleString('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      })}`;
    }
  };

  const isLoading = isLoadingPoolData || isLoadingLoopMarkets;

  return (
    <>
      <Card className="w-full bg-[#171717] text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-black font-bold">M</span>
            </div>
            Mode Market
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-xl">Staking</span>
            <Image
              alt="ion logo"
              width={20}
              height={20}
              src="/img/logo/ion.png"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex justify-between flex-wrap gap-y-6">
            {/* Left group */}
            <div className="flex gap-12">
              <div>
                <p className="text-sm text-gray-400">TOTAL MARKET SIZE</p>
                <p className="text-xl font-semibold">
                  {isLoading
                    ? 'Loading...'
                    : formatCurrency(
                        poolData
                          ? poolData.totalSuppliedFiat +
                              poolData.totalBorrowedFiat
                          : 0
                      )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">TOTAL AVAILABLE</p>
                <p className="text-xl font-semibold">
                  {isLoading
                    ? 'Loading...'
                    : formatCurrency(poolData?.totalSuppliedFiat)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">TOTAL BORROWS</p>
                <p className="text-xl font-semibold">
                  {isLoading
                    ? 'Loading...'
                    : formatCurrency(poolData?.totalBorrowedFiat)}
                </p>
              </div>
            </div>

            {/* Right group */}
            <div className="flex gap-12">
              <div>
                <p className="text-sm text-gray-400">APR</p>
                <p className="text-xl font-semibold">{apr}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">IONIC DISTRIBUTED</p>
                <p className="text-xl font-semibold">$2,452,751.00</p>
              </div>
            </div>
          </div>

          <Separator className="my-6 bg-gray-800" />

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button
              variant="default"
              className="bg-accent text-black hover:bg-[#7fff7f] w-[200px]"
              onClick={() => setWrapWidgetOpen(true)}
            >
              <span>Wrap ETH</span>
              <Image
                src={`/img/symbols/32/color/${chain === mode.id ? 'eth' : 'frxeth'}.png`}
                alt="From Token"
                className="w-5 h-5 mx-1"
                width={20}
                height={20}
              />
              <ArrowRight className="h-4 w-4 mx-1" />
              <Image
                src={`/img/symbols/32/color/${chain === mode.id ? 'weth' : 'wfrxeth'}.png`}
                alt="To Token"
                className="w-5 h-5"
                width={20}
                height={20}
              />
            </Button>

            <Link
              href={`/stake?chain=${+chain === mode.id || +chain === base.id || +chain === optimism.id ? chain : '34443'}`}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-accent text-black hover:bg-[#7fff7f] h-10 px-4 py-2"
              style={{ width: '200px' }}
            >
              Stake
            </Link>
          </div>
        </CardContent>
      </Card>

      <WrapWidget
        close={() => setWrapWidgetOpen(false)}
        open={wrapWidgetOpen}
        chain={+chain}
      />
    </>
  );
};

export default MarketInfo;
