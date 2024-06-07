'use client';

import React from 'react';
import { useChainId } from 'wagmi';

import Leverage from '../_components/Leverage';
import LeveragedPositionsInfo from '../_components/LeveragedPositionsInfo';
import ResultHandler from '../_components/ResultHandler';

import { useFusePoolData } from '@ui/hooks/useFusePoolData';

export default function Page() {
  const chainId = useChainId();
  const { data: marketData, isLoading: isLoadingMarketData } = useFusePoolData(
    '0',
    chainId,
    true
  );

  return (
    <>
      <div className={`md:flex`}>
        <div
          className={`grow-0 shrink-0 basis-[350px] lg:basis-[450px] md:mr-4 md:mb-0 bg-grayone rounded-xl py-3 px-6 mb-2 `}
        >
          <ResultHandler
            center
            isLoading={isLoadingMarketData}
          >
            {marketData && <Leverage marketData={marketData} />}
          </ResultHandler>
        </div>

        <div
          className={`grow-0 shrink-1 basis-[100%] bg-grayone rounded-xl py-3 px-6`}
        >
          <LeveragedPositionsInfo />
        </div>
      </div>
    </>
  );
}
