'use client';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { useChainId } from 'wagmi';

import ResultHandler from './ResultHandler';

import { useGetPositionsInfoQuery } from '@ui/hooks/levato/usePositionsInfo';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';

export default function LeveragedPositionsInfo() {
  const chainId = useChainId();
  const { data: marketData, isLoading: isLoadingMarketData } = useFusePoolData(
    '0',
    chainId
  );
  const { data: positionsData, isLoading: isLoadingPositionsData } =
    useGetPositionsInfoQuery();
  const currentVisiblePositions = useMemo(
    () => positionsData[0],
    [positionsData]
  );

  console.log(marketData);

  console.log(currentVisiblePositions);

  return (
    <ResultHandler
      center
      isLoading={isLoadingPositionsData || isLoadingMarketData}
    >
      <div
        className={`w-full gap-x-1 hidden lg:grid  grid-cols-18 items-start py-4 text-[10px] text-white/40 font-semibold text-center px-2 `}
      >
        <div className={`col-span-3`}>LONG / SHORT</div>
        <div className={`col-span-3`}>VALUE</div>
        <div className={`col-span-3`}>LEVERAGE</div>
        <div className={`col-span-3`}>PNL</div>
        <div className={`col-span-3`}>MARK/LIQ PRICE</div>
        <div className={`col-span-3`}>ACTIONS</div>
      </div>

      {currentVisiblePositions.map((position) => {
        const positionCollateralAsset = marketData?.assets.find(
          (asset) => asset.underlyingToken === position.collateralAsset
        );
        const positionStableAsset = marketData?.assets.find(
          (asset) => asset.underlyingToken === position.stableAsset
        );

        console.log(positionCollateralAsset, positionStableAsset);

        if (!positionCollateralAsset || !positionStableAsset) {
          return <></>;
        }

        return (
          <div
            className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 lg:grid  grid-cols-18  py-4 text-xs text-white/80 font-semibold lg:text-center items-center relative`}
            key={position.positionAddress}
          >
            <div
              className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
            >
              <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
                LONG / SHORT
              </span>
              <Image
                alt="Alt"
                height="40"
                src={`/img/symbols/32/color/${positionCollateralAsset.underlyingSymbol.toLowerCase()}.png`}
                style={{ display: 'inline' }}
                width="40"
              />{' '}
              {'WBTC'} /{' '}
              <Image
                alt="Alt"
                height="40"
                src={`/img/symbols/32/color/${positionStableAsset.underlyingSymbol.toLowerCase()}.png`}
                style={{ display: 'inline' }}
                width="40"
              />{' '}
              {'WETH'}
            </div>

            <div
              className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
            >
              <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
                VALUE
              </span>
              test
            </div>

            <div
              className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
            >
              <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
                LEVERAGE
              </span>
              test
            </div>

            <div
              className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
            >
              <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
                PNL
              </span>
              test
            </div>

            <div
              className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
            >
              <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
                MARK/LIQ PRICE
              </span>
              test
            </div>

            <div
              className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
            >
              test
            </div>
          </div>
        );
      })}
    </ResultHandler>
  );
}
