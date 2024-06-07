'use client';
import { useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import {
  formatEther,
  formatUnits,
  parseEther,
  parseUnits
} from 'ethers/lib/utils';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useBalance, useChainId } from 'wagmi';

import ResultHandler from './ResultHandler';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useLevatoUsdPrice } from '@ui/hooks/levato/useLevatoUsdPrice';
import { usePositionsGraphInfo } from '@ui/hooks/levato/usePositionsGraphInfo';
import { useGetPositionsInfoQuery } from '@ui/hooks/levato/usePositionsInfo';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';

export default function LeveragedPositionsInfo() {
  const { address } = useMultiIonic();
  const chainId = useChainId();
  const { data: marketData, isLoading: isLoadingMarketData } = useFusePoolData(
    '0',
    chainId
  );
  const [closingPositions, setClosingPositions] = useState<string[]>([]);
  const { data: positionsData, isLoading: isLoadingPositionsData } =
    useGetPositionsInfoQuery();

  const currentVisiblePositions = useMemo(
    () => (positionsData ? positionsData[0] : undefined),
    [positionsData]
  );
  const { data: graphData } = usePositionsGraphInfo(
    currentVisiblePositions?.map((position) =>
      position.positionAddress.toLowerCase()
    ) ?? []
  );
  const positionsCreatedData = useMemo(
    () => (graphData ? graphData[2].positionCreateds : undefined),
    [graphData]
  );
  const { data: levatoUsdPrice, isLoading: isLoadingLevatoUsdPrice } =
    useLevatoUsdPrice('0xd988097fb8612cc24eeC14542bC03424c656005f');
  const { levatoSdk } = useMultiIonic();
  const queryClient = useQueryClient();
  const { refetch: refetchBalance } = useBalance({ address });

  const handlePositionClosing = async (positionAddress: string) => {
    try {
      setClosingPositions((closingPositions) => [
        ...closingPositions,
        positionAddress
      ]);

      const tx = await levatoSdk?.closePosition(positionAddress);

      await tx?.wait();

      toast.success(
        `Position 0x${positionAddress.slice(-5)} closed successfully!`
      );

      setClosingPositions((closingPositions) =>
        closingPositions.filter((position) => position !== positionAddress)
      );

      queryClient.invalidateQueries(['positions']);

      const currentPosition = currentVisiblePositions?.find(
        (position) => position.positionAddress === positionAddress
      );

      if (currentPosition) {
        refetchBalance();
      }
    } catch (error) {
      console.error(error);

      toast.error(`Failed to close position`);

      setClosingPositions((closingPositions) =>
        closingPositions.filter((position) => position !== positionAddress)
      );
    }
  };

  return (
    <ResultHandler
      center
      isLoading={
        isLoadingPositionsData || isLoadingMarketData || isLoadingLevatoUsdPrice
      }
    >
      <div
        className={`w-full gap-x-1 hidden lg:grid  grid-cols-18 items-start py-4 text-[10px] text-white/40 font-semibold text-center px-2 `}
      >
        <div className={`col-span-3`}>POSITION</div>
        <div className={`col-span-3`}>NET VALUE</div>
        <div className={`col-span-3`}>ENTRY PRICE</div>
        <div className={`col-span-3`}>PNL</div>
        <div className={`col-span-3`}>MARK/LIQ PRICE</div>
        <div className={`col-span-3`}>ACTIONS</div>
      </div>

      {currentVisiblePositions && currentVisiblePositions.length ? (
        currentVisiblePositions.map((position) => {
          const positionCollateralAsset = marketData?.assets.find(
            (asset) => asset.underlyingToken === position.collateralAsset
          );
          const positionStableAsset = marketData?.assets.find(
            (asset) => asset.underlyingToken === position.stableAsset
          );
          const positionCreatedData = positionsCreatedData?.find(
            (positionGraphData) =>
              positionGraphData.position ===
              position.positionAddress.toLocaleLowerCase()
          );
          const usdcPriceOnCreation = positionCreatedData
            ? BigNumber.from(positionCreatedData.usdcPriceOnCreation)
            : levatoUsdPrice ?? BigNumber.from('1');

          if (!positionCollateralAsset || !positionStableAsset) {
            return <></>;
          }

          const entryValue = Number(
            formatUnits(
              parseUnits(
                '1',
                position.isShort
                  ? positionStableAsset.underlyingDecimals
                  : positionCollateralAsset.underlyingDecimals
              )
                .mul(
                  position.isShort
                    ? position.borrowedPriceOnCreation
                    : position.collateralPriceOnCreation
                )
                .div(usdcPriceOnCreation ?? '1'),
              6
            )
          );

          const marketValue = Number(
            formatUnits(
              parseUnits(
                '1',
                position.isShort
                  ? positionStableAsset.underlyingDecimals
                  : positionCollateralAsset.underlyingDecimals
              )
                .mul(
                  position.isShort
                    ? position.borrowedAssetPrice ?? 0
                    : position.collateralAssetPrice ?? 0
                )
                .div(levatoUsdPrice ?? 1),
              6
            )
          );

          const liquidationValue = Number(
            formatUnits(
              parseUnits(
                '1',
                position.isShort
                  ? positionStableAsset.underlyingDecimals
                  : positionCollateralAsset.underlyingDecimals
              )
                .mul(
                  position.isShort
                    ? position.borrowedLiquidationPrice ?? 0
                    : position.collateralLiquidationPrice ?? 0
                )
                .div(levatoUsdPrice ?? 1),
              6
            )
          );
          const currentNetValue = Number(
            formatUnits(
              parseEther('1')
                .mul(position.equityValue)
                .div(levatoUsdPrice ?? 1),
              6
            )
          );
          const positionRatio = marketValue / currentNetValue;
          const initialPositionNetValue = entryValue / positionRatio;
          const positionPnl = Number(
            (
              (position.isShort
                ? initialPositionNetValue - currentNetValue
                : currentNetValue - initialPositionNetValue) *
              Number(formatEther(position.leverageRatio))
            ).toLocaleString('en-US', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2
            })
          );

          return (
            <div
              className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 lg:grid  grid-cols-18  py-4 text-xs text-white/80 font-semibold lg:text-center items-center relative`}
              key={position.positionAddress}
            >
              <div
                className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
              >
                <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
                  POSITION
                </span>
                <Image
                  alt="Alt"
                  height="16"
                  src={`/img/symbols/32/color/${
                    position.isShort
                      ? positionStableAsset.underlyingSymbol.toLowerCase()
                      : positionCollateralAsset.underlyingSymbol.toLowerCase()
                  }.png`}
                  style={{
                    display: 'inline-block',
                    position: 'relative',
                    top: '-1px',
                    verticalAlign: 'middle'
                  }}
                  width="16"
                />{' '}
                {position.isShort
                  ? positionStableAsset.underlyingSymbol
                  : positionCollateralAsset.underlyingSymbol}
                <span className="block">
                  {Number(formatEther(position.leverageRatio)).toFixed(2)}x{' '}
                  <span
                    className={position.isShort ? 'text-error' : 'text-accent'}
                  >
                    {position.isShort ? 'Short' : 'Long'}
                  </span>
                </span>
              </div>

              <div
                className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
              >
                <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
                  VALUE
                </span>
                $
                {currentNetValue.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                })}
              </div>

              <div
                className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
              >
                <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
                  ENTRY PRICE
                </span>
                <span>
                  $
                  {entryValue.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}
                </span>
              </div>

              <div
                className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
              >
                <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
                  PNL
                </span>
                <span
                  className={
                    positionPnl !== 0
                      ? positionPnl < 0
                        ? 'text-error'
                        : 'text-accent'
                      : ''
                  }
                >
                  {positionPnl < 0 && '-'}$
                  {positionPnl.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}
                </span>
              </div>

              {/* <div
              className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
            >
              <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
                PNL
              </span>
              test
            </div> */}

              <div
                className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
              >
                <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
                  MARK/LIQ PRICE
                </span>
                $
                {marketValue.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                })}{' '}
                / $
                {liquidationValue.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                })}
              </div>

              <div
                className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
              >
                <button
                  className="btn-green text-sm uppercase"
                  disabled={
                    closingPositions.indexOf(position.positionAddress) > -1
                  }
                  onClick={() =>
                    handlePositionClosing(position.positionAddress)
                  }
                >
                  <ResultHandler
                    height="20"
                    isLoading={
                      closingPositions.indexOf(position.positionAddress) > -1
                    }
                    width="20"
                  >
                    Close
                  </ResultHandler>
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center">No open positions</div>
      )}
    </ResultHandler>
  );
}
