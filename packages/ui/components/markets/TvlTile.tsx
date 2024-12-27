/* eslint-disable @next/next/no-img-element */
'use client';

// import dynamic from 'next/dynamic';
// import { fraxtal } from 'viem/chains';

// import SwapWidget from './SwapWidget';
// const SwapWidget = dynamic(() => import('./SwapWidget'), {
//   ssr: false
// });

import { pools } from '@ui/constants/index';
import type { PoolData } from '@ui/types/TokensDataMap';

import ResultHandler from '../ResultHandler';
import React from 'react';

interface IProp {
  dropdownSelectedChain: string;
  poolData: PoolData;
  isLoadingPoolData: boolean;
  isLoadingLoopMarkets: boolean;
  selectedPool: string;
  vaultData?: {
    totalSuppliedFiat: number;
  };
  isLoadingVaults?: boolean;
}

export default function TvlTile({
  dropdownSelectedChain,
  poolData,
  isLoadingPoolData,
  isLoadingLoopMarkets,
  selectedPool,
  vaultData,
  isLoadingVaults
}: IProp) {
  const isVaultView = selectedPool === 'vault';
  const isLoading =
    isLoadingPoolData || isLoadingLoopMarkets || isLoadingVaults;

  return (
    <div className="w-full h-full col-span-3 px-2 lg:px-[2%] xl:px-[3%] flex flex-wrap flex-col items-center justify-center md:justify-start bg-grayone py-4 rounded-md">
      <div className="flex md:flex-row flex-col w-full md:gap-2">
        {Object.entries(pools)
          .filter(([chainId]) => chainId === dropdownSelectedChain.toString())
          .map(([, chainData], chainIdx) => (
            <React.Fragment key={chainIdx}>
              {isVaultView
                ? chainData.vaults?.map((vault, vaultIdx) => (
                    <div
                      className="flex items-center justify-center gap-2"
                      key={`vault-${vaultIdx}`}
                    >
                      <img
                        alt="modlogo"
                        className="md:w-8 w-6"
                        src={chainData.logo}
                      />
                      <h1 className="font-semibold">{vault.name}</h1>
                    </div>
                  ))
                : chainData.pools.map((pool, poolIdx) => (
                    <div
                      className={`flex items-center justify-center gap-2 ${
                        pool.id === selectedPool ? 'flex' : 'hidden'
                      }`}
                      key={`pool-${poolIdx}`}
                    >
                      <img
                        alt="modlogo"
                        className="md:w-8 w-6"
                        src={chainData.logo}
                      />
                      <h1 className="font-semibold">{pool.name}</h1>
                    </div>
                  ))}
            </React.Fragment>
          ))}
      </div>

      <div className="h-[2px] w-[95%] mx-auto bg-white/10 lg:my-3 my-2" />

      <div className="w-full flex flex-wrap items-center justify-center md:justify-start gap-4">
        <ResultHandler isLoading={!!isLoading}>
          {isVaultView ? (
            <div className="flex flex-col items-start justify-center gap-y-1">
              <p className="text-white/60 md:text-xs text-[10px]">
                Total Value Locked
              </p>
              <p className="font-semibold md:text-base text-xs">
                $
                {vaultData?.totalSuppliedFiat.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }) ?? '0'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-start justify-center gap-y-1">
                <p className="text-white/60 md:text-xs text-[10px]">
                  Total Market Size
                </p>
                <p className="font-semibold md:text-base text-xs">
                  $
                  {poolData
                    ? (
                        poolData?.totalSuppliedFiat +
                        poolData?.totalBorrowedFiat
                      ).toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2
                      })
                    : '0'}
                </p>
              </div>
              <div className="flex flex-col items-start justify-center gap-y-1">
                <p className="text-white/60 md:text-xs text-[10px]">
                  Total Supplied
                </p>
                <p className="font-semibold md:text-base text-xs">
                  $
                  {poolData?.totalSuppliedFiat.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  }) ?? '0'}
                </p>
              </div>
              <div className="flex flex-col items-start justify-center gap-y-1">
                <p className="text-white/60 md:text-xs text-[10px]">
                  Total Borrows
                </p>
                <p className="font-semibold md:text-base text-xs">
                  $
                  {poolData?.totalBorrowedFiat.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  }) ?? '0'}
                </p>
              </div>
            </>
          )}
        </ResultHandler>
      </div>
    </div>
  );
}
