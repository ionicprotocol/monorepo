'use client';
import { useQueryClient } from '@tanstack/react-query';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useBalance, useChainId } from 'wagmi';

import ResultHandler from './ResultHandler';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useGetPositionsInfoQuery } from '@ui/hooks/levato/usePositionsInfo';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { usePositionsPnl } from '@ui/hooks/levato/usePositionsPnl';
import { BigNumber } from 'ethers';

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
  const { data: usdPrice, isLoading: isLoadingUSDPrice } = useUsdPrice(
    chainId.toString()
  );
  const { levatoSdk } = useMultiIonic();
  const queryClient = useQueryClient();
  const { refetch: refetchBalance } = useBalance({ address });
  const { data: positionsPnL } = usePositionsPnl();

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
        isLoadingPositionsData || isLoadingMarketData || isLoadingUSDPrice
      }
    >
      <div
        className={`w-full gap-x-1 hidden lg:grid  grid-cols-15 items-start py-4 text-[10px] text-white/40 font-semibold text-center px-2 `}
      >
        <div className={`col-span-3`}>POSITION</div>
        <div className={`col-span-3`}>VALUE</div>
        <div className={`col-span-3`}>PNL</div>
        {/* <div className={`col-span-3`}>PNL</div> */}
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
          const pnlData = positionsPnL?.get(position.positionAddress);
          let pnl = BigNumber.from('0');

          if (pnlData) {
            const pnlAmount = BigNumber.from(pnlData.fundedCollateralAmount);
            const fundingValue = position.collateralAssetPrice
              .mul(pnlAmount)
              .div(BigNumber.from('10').pow(BigNumber.from('18')));

            pnl = fundingValue.sub(position.equityValue);
          }

          console.log(pnl.toString());

          if (!positionCollateralAsset || !positionStableAsset) {
            return <></>;
          }

          return (
            <div
              className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 lg:grid  grid-cols-15  py-4 text-xs text-white/80 font-semibold lg:text-center items-center relative`}
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
                {(
                  Number(formatEther(position.positionValue)) * (usdPrice ?? 0)
                ).toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                })}
              </div>

              <div
                className={`col-span-3 flex lg:block justify-center items-center mb-2 lg:mb-0`}
              >
                <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
                  PNL
                </span>
                0.00
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
                {(
                  Number(
                    formatEther(
                      position.isShort
                        ? positionStableAsset.underlyingPrice
                        : positionCollateralAsset.underlyingPrice
                    )
                  ) * (usdPrice ?? 0)
                ).toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                })}{' '}
                / $
                {(
                  Number(
                    formatUnits(
                      position.isShort
                        ? position.borrowedLiquidationPrice
                        : position.collateralLiquidationPrice,
                      28 // 36 - usdc decimals (6)
                    )
                  ) * (usdPrice ?? 0)
                ).toLocaleString('en-US', {
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
