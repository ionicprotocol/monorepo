import React, { useState } from 'react';

import type { MarketRowData } from '@ui/hooks/market/useMarketData';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import WrapEthSwaps from './WrapEthSwaps';
import ResultHandler from '../ResultHandler';

interface FeaturedMarketTileProps {
  selectedChain: number;
  setIsManageDialogOpen: (open: boolean) => void;
  setSelectedSymbol: (symbol: string | undefined) => void;
  isLoadingPoolData: boolean;
  dropdownSelectedChain: string;
  featuredMarkets: MarketRowData[];
}

const FeaturedMarketTile = ({
  selectedChain,
  setIsManageDialogOpen,
  setSelectedSymbol,
  isLoadingPoolData,
  dropdownSelectedChain,
  featuredMarkets
}: FeaturedMarketTileProps) => {
  const [swapWidgetOpen, setSwapWidgetOpen] = useState<boolean>(false);
  const [wrapWidgetOpen, setWrapWidgetOpen] = useState<boolean>(false);

  return (
    <div className="w-full col-span-3 h-full px-2 lg:px-[2%] xl:px-[3%] flex flex-col items-center justify-start gap-3 bg-grayone py-4 rounded-md">
      <span className="mr-auto text-xl font-semibold">Featured Markets</span>
      <div className="w-full gap-x-3 hidden lg:grid grid-cols-4 items-start text-[10px] text-white/40 font-semibold text-center px-2">
        <h3>ASSETS</h3>
        <h3>APR</h3>
      </div>
      <ResultHandler
        center
        isLoading={isLoadingPoolData}
      >
        {featuredMarkets.map((market) => (
          <div
            key={market.asset}
            className="lg:grid lg:grid-cols-4 flex flex-col gap-x-3 w-full items-center justify-center px-1 py-3 hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl"
          >
            <div className="flex items-center justify-center gap-1 mr-auto sm:mr-0 ml-2 lg:ml-0">
              <img
                src={`/img/symbols/32/color/${market.asset.toLowerCase()}.png`}
                alt={market.asset}
                className="w-4 inline-block"
              />
              <span className="text-xs">{market.asset}</span>
            </div>
            <div className="popover-container relative flex lg:flex-col items-center justify-between lg:justify-center cursor-pointer w-full gap-2 lg:pt-0 py-3 lg:py-0">
              <span className="text-white/40 font-semibold lg:mr-0 mr-auto ml-2 lg:ml-0 text-[11px] lg:hidden text-left">
                APR
              </span>
              <div className="flex lg:flex-col md:ml-0 my-auto items-center justify-center">
                <span className="mr-1 md:mr-0 text-xs text-center">
                  +
                  {market.supplyAPRTotal?.toLocaleString('en-US', {
                    maximumFractionDigits: 1
                  }) ?? '-'}
                  %
                </span>
              </div>
            </div>
            <button
              className="rounded-md bg-accent text-black lg:py-1.5 py-1 px-1 col-span-2 uppercase truncate text-xs w-[80%] mx-auto"
              onClick={async () => {
                const result = await handleSwitchOriginChain(
                  Number(dropdownSelectedChain),
                  selectedChain
                );
                if (result) {
                  setSelectedSymbol(market.asset);
                  setIsManageDialogOpen(true);
                }
              }}
            >
              Supply / Withdraw
            </button>
          </div>
        ))}
      </ResultHandler>
      <WrapEthSwaps
        setSwapWidgetOpen={setSwapWidgetOpen}
        swapWidgetOpen={swapWidgetOpen}
        dropdownSelectedChain={+dropdownSelectedChain}
        setWrapWidgetOpen={setWrapWidgetOpen}
        wrapWidgetOpen={wrapWidgetOpen}
      />
    </div>
  );
};

export default FeaturedMarketTile;
