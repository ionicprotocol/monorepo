'use client';

import React from 'react';
import { useChainId } from 'wagmi';

import Leverage from '../_components/Leverage';
import ResultHandler from '../_components/ResultHandler';

import { useFusePoolData } from '@ui/hooks/useFusePoolData';

export default function Page() {
  const chainId = useChainId();
  const { data: marketData, isLoading: isLoadingMarketData } = useFusePoolData(
    '0',
    chainId
  );

  return (
    <>
      <div className={`flex`}>
        <div
          className={`grow-0 shrink-0 basis-[450px] mr-4 bg-grayone rounded-xl py-3 px-6`}
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
          test
        </div>
      </div>
    </>
  );
}
