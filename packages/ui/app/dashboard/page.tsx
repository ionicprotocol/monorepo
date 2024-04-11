/* eslint-disable @next/next/no-img-element */
'use client';

import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import millify from 'millify';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useChainId } from 'wagmi';

import InfoRows, { InfoMode } from '../_components/dashboards/InfoRows';
import type { PopupMode } from '../_components/popup/page';
import Popup from '../_components/popup/page';
import ResultHandler from '../_components/ResultHandler';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useHealthFactor } from '@ui/hooks/pools/useHealthFactor';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useMaxBorrowAmounts } from '@ui/hooks/useMaxBorrowAmounts';
import {
  usePointsForBorrow,
  usePointsForSupply
} from '@ui/hooks/usePointsQueries';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import { useUsetNetApr } from '@ui/hooks/useUserNetApr';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export default function Dashboard() {
  const { currentSdk } = useMultiIonic();
  const chainId = useChainId();
  const [selectedSymbol, setSelectedSymbol] = useState<string>();
  const [popupMode, setPopupMode] = useState<PopupMode>();
  const { data: marketData, isLoading: isLoadingMarketData } = useFusePoolData(
    '0',
    chainId
  );
  const { data: assetsSupplyAprData, isLoading: isLoadingAssetsSupplyAprData } =
    useTotalSupplyAPYs(marketData?.assets ?? [], chainId);
  const suppliedAssets = useMemo<MarketData[]>(
    () =>
      marketData?.assets.filter((asset) => asset.supplyBalanceFiat > 0) ?? [],
    [marketData]
  );
  const borrowedAssets = useMemo<MarketData[]>(
    () =>
      marketData?.assets.filter((asset) => asset.borrowBalanceFiat > 0) ?? [],
    [marketData]
  );
  const { data: userNetApr, isLoading: isLoadingUserNetApr } = useUsetNetApr();
  const { borrowApr, netAssetValue, supplyApr } = useMemo(() => {
    if (marketData && assetsSupplyAprData && currentSdk) {
      const blocksPerMinute = getBlockTimePerMinuteByChainId(chainId);
      let totalCollateral = 0;
      let avgCollateralApr = 0;
      let borrowApr = 0;
      let supplyApr = 0;
      let memberships = 0;

      marketData.assets.forEach((asset) => {
        if (asset.membership) {
          totalCollateral += asset.supplyBalanceFiat;
          avgCollateralApr += assetsSupplyAprData[asset.cToken].apy;

          memberships++;
        }

        if (asset.borrowBalanceFiat) {
          borrowApr += currentSdk.ratePerBlockToAPY(
            asset.borrowRatePerBlock,
            blocksPerMinute
          );
        }

        if (asset.supplyBalanceFiat) {
          supplyApr += currentSdk.ratePerBlockToAPY(
            asset.supplyRatePerBlock,
            blocksPerMinute
          );
        }
      });

      supplyApr = supplyApr / (suppliedAssets.length || 1);
      borrowApr = borrowApr / (borrowedAssets.length || 1);

      return {
        avgCollateralApr: `${(avgCollateralApr / memberships).toFixed(2)}%`,
        borrowApr: `${borrowApr.toFixed(2)}%`,
        netAssetValue: `$${millify(
          (marketData?.totalSupplyBalanceFiat ?? 0) -
            (marketData?.totalBorrowBalanceFiat ?? 0),
          { precision: 2 }
        )}`,
        supplyApr: `${supplyApr.toFixed(2)}%`,
        totalCollateral: `$${millify(totalCollateral, { precision: 2 })}`
      };
    }

    return {};
  }, [
    assetsSupplyAprData,
    borrowedAssets,
    currentSdk,
    chainId,
    marketData,
    suppliedAssets
  ]);
  const selectedMarketData = useMemo<MarketData | undefined>(
    () =>
      marketData?.assets.find(
        (_asset) => _asset.underlyingSymbol === selectedSymbol
      ),
    [marketData, selectedSymbol]
  );
  const { data: healthData, isLoading: isLoadingHealthData } = useHealthFactor(
    marketData?.comptroller,
    chainId
  );
  const handledHealthData = useMemo<string>(() => {
    if (
      marketData?.totalBorrowBalanceNative === 0 ||
      parseFloat(healthData ?? '0') < 0
    ) {
      return '∞';
    }

    return healthData ?? '∞';
  }, [healthData, marketData]);
  const { data: supplyPoints, isLoading: isLoadingSupplyPoints } =
    usePointsForSupply();
  const { data: borrowPoints, isLoading: isLoadingBorrowPoints } =
    usePointsForBorrow();
  const { data: borrowCaps, isLoading: isLoadingBorrowCaps } =
    useMaxBorrowAmounts(
      marketData?.assets ?? [],
      marketData?.comptroller ?? '',
      chainId
    );
  const totalPoints = useMemo<number>(() => {
    if (supplyPoints && borrowPoints) {
      return (
        supplyPoints.rows.reduce(
          (accumulator, current) =>
            accumulator +
            current.reduce(
              (innerAccumulator, innerCurrent) =>
                innerAccumulator + innerCurrent,
              0
            ),
          0
        ) +
        borrowPoints.rows.reduce(
          (accumulator, current) =>
            accumulator +
            current.reduce(
              (innerAccumulator, innerCurrent) =>
                innerAccumulator + innerCurrent,
              0
            ),
          0
        )
      );
    }

    return 0;
  }, [borrowPoints, supplyPoints]);
  const healthColorClass = useMemo<string>(() => {
    const healthDataAsNumber = parseFloat(healthData ?? '0');

    if (isNaN(parseFloat(handledHealthData))) {
      return '';
    }

    if (healthDataAsNumber >= 3) {
      return 'text-accent';
    }

    if (healthDataAsNumber >= 1.5) {
      return 'text-lime';
    }

    return 'text-error';
  }, [handledHealthData, healthData]);
  const utilizations = useMemo<string[]>(() => {
    if (borrowCaps && marketData) {
      return borrowCaps.map((borrowCap, i) => {
        const totalBorrow = marketData.assets[i].borrowBalance.add(
          borrowCap?.bigNumber ?? '0'
        );

        return `${
          totalBorrow.lte('0') || marketData.assets[i].borrowBalance.lte(0)
            ? '0.00'
            : (
                100 /
                totalBorrow.div(marketData.assets[i].borrowBalance).toNumber()
              ).toFixed(2)
        }%`;
      });
    }

    return marketData?.assets.map(() => '0.00%') ?? [];
  }, [borrowCaps, marketData]);

  return (
    <>
      <div className="w-full flex flex-col items-start justify-start transition-all duration-200 ease-linear">
        <div
          className={`lg:grid grid-cols-8 gap-x-3 my-2 w-full  font-semibold text-base `}
        >
          <div
            className={`w-full mb-2 lg:mb-0 bg-grayone rounded-xl py-3 px-6   col-span-3   flex flex-col items-center justify-start `}
          >
            <div className={`w-full flex justify-between  pb-6 items-center`}>
              <span>NET ASSET VALUE</span>
              <ResultHandler
                height="24"
                isLoading={!netAssetValue}
                width="24"
              >
                <span> {netAssetValue}</span>
              </ResultHandler>
            </div>
            <div className={`flex items-center justify-between w-full gap-x-3`}>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 text-xs`}>Total Supply</p>
                <ResultHandler
                  height="24"
                  isLoading={isLoadingMarketData}
                  width="24"
                >
                  <p className={`font-semibold`}>
                    ${millify(marketData?.totalSupplyBalanceFiat ?? 0)}
                  </p>
                </ResultHandler>
                {/* this neeeds to be changed */}
              </div>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 text-xs`}>Total Borrow</p>
                <ResultHandler
                  height="24"
                  isLoading={isLoadingMarketData}
                  width="24"
                >
                  <p className={`font-semibold`}>
                    ${millify(marketData?.totalBorrowBalanceFiat ?? 0)}
                  </p>
                </ResultHandler>
                {/* this neeeds to be changed */}
              </div>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 text-xs`}>Position Health</p>
                <ResultHandler
                  height="24"
                  isLoading={isLoadingHealthData}
                  width="24"
                >
                  <div className="popover-container">
                    <p className={`font-semibold ${healthColorClass}`}>
                      {handledHealthData} <i className="popover-hint">i</i>
                    </p>

                    <div className="popover absolute w-[250px] top-full left-[50%] p-2 mt-1 ml-[-125px] border border-lime rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all">
                      Health Factor represents safety of your deposited
                      collateral against the borrowed assets and its underlying
                      value. If the health factor goes below 1, the liquidation
                      of your collateral might be triggered.
                    </div>
                  </div>
                </ResultHandler>
                {/* this neeeds to be changed */}
              </div>
            </div>
          </div>
          <div
            className={`w-full mb-2 lg:mb-0 bg-grayone rounded-xl py-3 px-6 col-span-3 flex flex-col items-center justify-start `}
          >
            <div className={`w-full flex justify-between  pb-6 items-center`}>
              <span>NET APR</span>
              <ResultHandler
                height="24"
                isLoading={isLoadingUserNetApr}
                width="24"
              >
                <div className="popover-container">
                  <span>
                    {Number(formatUnits(userNetApr ?? '0')).toFixed(2)}%{' '}
                    <i className="popover-hint">i</i>
                  </span>

                  <div className="popover absolute w-[250px] top-full left-[50%] p-2 mt-1 ml-[-125px] border border-lime rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all">
                    Net APR is the difference between the average borrowing APR
                    you are paying versus the average supply APR you are
                    earning. This does not include the future value of Ionic
                    points that you are earning!
                  </div>
                </div>
              </ResultHandler>
            </div>
            <div className={`flex items-center justify-between w-full gap-x-3`}>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 text-xs`}>Avg. Borrowing APR</p>
                <ResultHandler
                  height="24"
                  isLoading={!borrowApr}
                  width="24"
                >
                  <p className={`font-semibold`}>{borrowApr}</p>
                </ResultHandler>
                {/* this neeeds to be changed */}
              </div>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 text-xs`}>Avg. Supply APR</p>
                <ResultHandler
                  height="24"
                  isLoading={!supplyApr}
                  width="24"
                >
                  <p className={`font-semibold`}>{supplyApr}</p>
                </ResultHandler>
                {/* this neeeds to be changed */}
              </div>
            </div>
          </div>
          <div
            className={`w-full mb-2 lg:mb-0 bg-grayone rounded-xl py-3 px-6 col-span-2 flex flex-col items-center justify-start `}
          >
            <div className={`w-full flex justify-between items-center mb-2`}>
              <span>TOTAL POINTS</span>
              <ResultHandler
                height="24"
                isLoading={isLoadingSupplyPoints || isLoadingBorrowPoints}
                width="24"
              >
                <span>
                  {Math.round(totalPoints).toLocaleString('en-us', {
                    maximumFractionDigits: 0
                  })}
                </span>
              </ResultHandler>
            </div>
            <Link
              className={`w-full rounded-md bg-accent text-black py-2 px-6 text-center text-xs mt-auto  `}
              href={`/points`}
            >
              VIEW POINTS
            </Link>
          </div>
        </div>
        <div className={`bg-grayone  w-full px-6 py-3 mt-3 rounded-xl`}>
          <div className={` w-full flex items-center justify-between py-3 `}>
            <h1 className={`font-semibold`}>Your Collateral (Supply)</h1>
          </div>

          <ResultHandler
            center
            isLoading={
              isLoadingMarketData ||
              isLoadingAssetsSupplyAprData ||
              isLoadingBorrowCaps
            }
          >
            <>
              {suppliedAssets.length > 0 ? (
                <>
                  <div
                    className={`w-full gap-x-1 hidden lg:grid  grid-cols-5  py-4 text-[10px] text-white/40 font-semibold text-center  `}
                  >
                    <h3 className={` `}>SUPPLY ASSETS</h3>
                    <h3 className={` `}>AMOUNT</h3>
                    <h3 className={` `}>SUPPLY APR</h3>
                  </div>

                  {suppliedAssets.map((asset, i) => (
                    <InfoRows
                      amount={`${
                        asset.supplyBalanceNative
                          ? parseFloat(
                              formatUnits(
                                asset.supplyBalance,
                                asset.underlyingDecimals
                              )
                            ).toLocaleString('en-US', {
                              maximumFractionDigits: 2
                            })
                          : '0'
                      } ${
                        asset.underlyingSymbol
                      } / $${asset.supplyBalanceFiat.toLocaleString('en-US', {
                        maximumFractionDigits: 2
                      })}`}
                      apr={`${
                        currentSdk
                          ?.ratePerBlockToAPY(
                            asset?.supplyRatePerBlock ?? BigNumber.from(0),
                            getBlockTimePerMinuteByChainId(chainId)
                          )
                          .toFixed(2) ?? '0.00'
                      }%`}
                      asset={asset.underlyingSymbol}
                      collateralApr={`${
                        assetsSupplyAprData
                          ? assetsSupplyAprData[asset.cToken]?.apy.toFixed(2)
                          : ''
                      }%`}
                      key={`supply-row-${asset.underlyingSymbol}`}
                      logo={`/img/symbols/32/color/${asset.underlyingSymbol.toLowerCase()}.png`}
                      membership={asset.membership}
                      mode={InfoMode.SUPPLY}
                      setPopupMode={setPopupMode}
                      setSelectedSymbol={setSelectedSymbol}
                      utilization={utilizations[i]}
                    />
                  ))}
                </>
              ) : (
                <div className="text-center mx-auto py-2">
                  No assets supplied!
                </div>
              )}
            </>
          </ResultHandler>
        </div>
        <div className={`bg-grayone  w-full px-6 py-3 mt-3 rounded-xl`}>
          <div className={` w-full flex items-center justify-between py-3 `}>
            <h1 className={`font-semibold`}>Your Borrows (Loans)</h1>
          </div>

          <ResultHandler
            center
            isLoading={
              isLoadingMarketData ||
              isLoadingAssetsSupplyAprData ||
              isLoadingBorrowCaps
            }
          >
            <>
              {borrowedAssets.length > 0 ? (
                <>
                  <div
                    className={`w-full gap-x-1 grid  grid-cols-5  py-4 text-[10px] text-white/40 font-semibold text-center  `}
                  >
                    <h3 className={` `}>BORROW ASSETS</h3>
                    <h3 className={` `}>AMOUNT</h3>
                    <h3 className={` `}>BORROW APR</h3>
                  </div>

                  {borrowedAssets.map((asset, i) => (
                    <InfoRows
                      amount={`${
                        asset.borrowBalanceFiat
                          ? parseFloat(
                              formatUnits(
                                asset.borrowBalance,
                                asset.underlyingDecimals
                              )
                            ).toLocaleString('en-US', {
                              maximumFractionDigits: 2
                            })
                          : '0'
                      } ${
                        asset.underlyingSymbol
                      } / $${asset.borrowBalanceFiat.toLocaleString('en-US', {
                        maximumFractionDigits: 2
                      })}`}
                      apr={`${
                        currentSdk
                          ?.ratePerBlockToAPY(
                            asset?.borrowRatePerBlock ?? BigNumber.from(0),
                            getBlockTimePerMinuteByChainId(chainId)
                          )
                          .toFixed(2) ?? '0.00'
                      }%`}
                      asset={asset.underlyingSymbol}
                      collateralApr={`${
                        assetsSupplyAprData
                          ? assetsSupplyAprData[asset.cToken]?.apy.toFixed(2)
                          : ''
                      }%`}
                      key={`supply-row-${asset.underlyingSymbol}`}
                      logo={`/img/symbols/32/color/${asset.underlyingSymbol.toLowerCase()}.png`}
                      membership={asset.membership}
                      mode={InfoMode.BORROW}
                      setPopupMode={setPopupMode}
                      setSelectedSymbol={setSelectedSymbol}
                      utilization={utilizations[i]}
                    />
                  ))}
                </>
              ) : (
                <div className="text-center mx-auto py-2">
                  No assets borrowed!
                </div>
              )}
            </>
          </ResultHandler>
        </div>
      </div>
      {popupMode && selectedMarketData && marketData && (
        <Popup
          closePopup={() => setPopupMode(undefined)}
          comptrollerAddress={marketData.comptroller}
          mode={popupMode}
          selectedMarketData={selectedMarketData}
        />
      )}
    </>
  );
}
