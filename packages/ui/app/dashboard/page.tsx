/* eslint-disable @next/next/no-img-element */
'use client';

import { useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import millify from 'millify';
import { type Address, formatEther, formatUnits, parseEther } from 'viem';
import { useChainId } from 'wagmi';

import { NO_COLLATERAL_SWAP, pools } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useCurrentLeverageRatios } from '@ui/hooks/leverage/useCurrentLeverageRatio';
import { usePositionsInfo } from '@ui/hooks/leverage/usePositionInfo';
import { usePositionsQuery } from '@ui/hooks/leverage/usePositions';
import { usePositionsSupplyApy } from '@ui/hooks/leverage/usePositionsSupplyApy';
import { useHealthFactor } from '@ui/hooks/pools/useHealthFactor';
import { useAllClaimableRewards } from '@ui/hooks/rewards/useAllClaimableRewards';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useLoopMarkets } from '@ui/hooks/useLoopMarkets';
import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import { useRewards } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import { useUserNetApr } from '@ui/hooks/useUserNetApr';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

import ClaimRewardPopover from '../_components/dashboards/ClaimRewardPopover';
import CollateralSwapPopup from '../_components/dashboards/CollateralSwapPopup';
import InfoRows, { InfoMode } from '../_components/dashboards/InfoRows';
import LoopRewards from '../_components/dashboards/LoopRewards';
import Loop from '../_components/dialogs/loop';
import ManageDialog from '../_components/dialogs/manage';
import NetworkSelector from '../_components/markets/NetworkSelector';
import ResultHandler from '../_components/ResultHandler';

import type { ActiveTab } from '../_components/dialogs/manage';

import type {
  FlywheelReward,
  OpenPosition,
  PositionInfo
} from '@ionicprotocol/types';

const PoolToggle = dynamic(() => import('../_components/markets/PoolToggle'), {
  ssr: false
});

export default function Dashboard() {
  const { currentSdk } = useMultiIonic();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const chain = querychain ? querychain : 34443;
  const pool = querypool ? querypool : '0';
  const [selectedSymbol, setSelectedSymbol] = useState<string>('WETH');
  const [activeTab, setActiveTab] = useState<ActiveTab>();
  const [isManageDialogOpen, setIsManageDialogOpen] = useState<boolean>(false);
  const [collateralSwapFromAsset, setCollateralSwapFromAsset] =
    useState<MarketData>();
  const walletChain = useChainId();

  const { data: marketData, isLoading: isLoadingMarketData } = useFusePoolData(
    pool ? pool : pools[+chain].pools[0].id,
    +chain
  );
  const { data: positions, isLoading: isLoadingPositions } =
    usePositionsQuery(+chain);

  const collateralsAPR = usePositionsSupplyApy(
    positions?.openPositions.map((position) => position.collateral) ?? [],
    positions?.openPositions.map((position) => position.chainId) ?? []
  );
  const { data: positionsInfo, isLoading: isLoadingPositionsInfo } =
    usePositionsInfo(
      positions?.openPositions.map((position) => position.address) ?? [],
      positions?.openPositions.map((position) =>
        collateralsAPR &&
        collateralsAPR[position.collateral.cToken] !== undefined
          ? parseEther(
              collateralsAPR[position.collateral.cToken].totalApy.toFixed(18)
            )
          : null
      ),
      positions?.openPositions.map((p) => p.chainId) ?? []
    );
  const { data: positionLeverages, isLoading: isLoadingPositionLeverages } =
    useCurrentLeverageRatios(
      positions?.openPositions.map((position) => position.address) ?? []
    );
  const { data: assetsSupplyAprData, isLoading: isLoadingAssetsSupplyAprData } =
    useTotalSupplyAPYs(marketData?.assets ?? [], +chain);
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
  const { data: loopData } = useLoopMarkets(
    marketData?.assets.map((asset) => asset.cToken) ?? [],
    +chain
  );
  const { borrowApr, netAssetValue, supplyApr } = useMemo(() => {
    if (marketData && assetsSupplyAprData && currentSdk) {
      const blocksPerMinute = getBlockTimePerMinuteByChainId(+chain);
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
    chain,
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
  const [selectedLoopBorrowData, setSelectedLoopBorrowData] =
    useState<MarketData>();
  const [isLoopDialogOpen, setIsLoopDialogOpen] = useState<boolean>(false);
  const { data: healthData, isLoading: isLoadingHealthData } = useHealthFactor(
    marketData?.comptroller,
    +chain
  );
  const { data: usdPrice, isLoading: isLoadingUSDPrice } = useUsdPrice(
    chain.toString()
  );
  const handledHealthData = useMemo<string>(() => {
    if (
      marketData?.totalBorrowBalanceNative === 0 ||
      Number.parseFloat(healthData ?? '0') < 0
    ) {
      return '∞';
    }

    return healthData ?? '∞';
  }, [healthData, marketData]);

  const { data: userNetApr, isLoading: isLoadingUserNetApr } = useUserNetApr();
  const healthColorClass = useMemo<string>(() => {
    const healthDataAsNumber = Number.parseFloat(healthData ?? '0');

    if (isNaN(Number.parseFloat(handledHealthData))) {
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

  const { data: rewards } = useRewards({
    chainId: +chain,
    poolId: pool
  });

  const allChains: number[] = Object.keys(pools).map(Number);
  const {
    data: claimableRewardsAcrossAllChains,
    isLoading: isLoadingClaimableRewardsAcrossAllChains
  } = useAllClaimableRewards(allChains);
  const totalRewardsAcrossAllChains =
    claimableRewardsAcrossAllChains?.reduce(
      (acc, reward) => acc + reward.amount,
      0n
    ) ?? 0n;

  const {
    componentRef: rewardRef,
    isopen: rewardisopen,
    toggle: rewardToggle
  } = useOutsideClick();
  const {
    componentRef: swapRef,
    isopen: swapOpen,
    toggle: swapToggle
  } = useOutsideClick();

  return (
    <>
      {swapOpen && marketData?.comptroller && (
        <CollateralSwapPopup
          toggler={() => swapToggle()}
          swapRef={swapRef}
          swappedFromAsset={collateralSwapFromAsset!}
          swappedToAssets={marketData?.assets.filter(
            (asset) =>
              asset?.underlyingToken !==
                collateralSwapFromAsset?.underlyingToken &&
              !NO_COLLATERAL_SWAP[+chain]?.[pool]?.includes(
                asset?.underlyingSymbol ?? ''
              )
          )}
          swapOpen={swapOpen}
          comptroller={marketData?.comptroller}
        />
      )}
      <ClaimRewardPopover
        chain={+chain}
        allchain={allChains}
        rewardRef={rewardRef}
        isOpen={rewardisopen}
        close={() => rewardToggle()}
      />
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

                    <div className="popover absolute w-[250px] right-0 md:right-auto top-full md:left-[50%] p-2 mt-1 md:ml-[-125px] border border-lime rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all">
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
              <span>NET APR (All Pools)</span>
              <ResultHandler
                height="24"
                isLoading={isLoadingUserNetApr}
                width="24"
              >
                <div className="popover-container">
                  <span>
                    {Number(formatEther(userNetApr ?? 0n)).toFixed(2)}%{' '}
                    <i className="popover-hint">i</i>
                  </span>

                  <div className="popover absolute w-[250px] top-full right-0 md:right-auto md:left-[50%] p-2 mt-1 md:ml-[-125px] border border-lime rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all">
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
              <span>Claimable Rewards</span>
              <ResultHandler
                height="24"
                isLoading={isLoadingClaimableRewardsAcrossAllChains}
                width="24"
              >
                <span className={`flex items-center justify-center gap-1`}>
                  {Math.round(
                    +formatEther(totalRewardsAcrossAllChains)
                  ).toLocaleString('en-us', {
                    maximumFractionDigits: 0
                  })}{' '}
                  <span className={`text-[8px] text-white/50 hidden`}>
                    (ION+hyUSD+eUSD)
                  </span>
                </span>
              </ResultHandler>
            </div>
            <div
              className={`w-full cursor-pointer rounded-md bg-accent text-black py-2 px-6 text-center text-xs mt-auto  `}
              onClick={() => rewardToggle()}
            >
              CLAIM ALL REWARDS
            </div>
          </div>
        </div>
        {/* <div
          className={`flex items-center justify-center text-sm gap-2 p-1 my-1`}
        >
          <button
            className={`py-2 px-4 border rounded-xl   ${
              poolMarket === '0' && selectedTab === 'MODE'
                ? 'bg-lime text-black'
                : ''
            }`}
            onClick={() => (setPoolMarket('0'), setSelectedTab('MODE'))}
          >
            Mode Main Market
          </button>
          <button
            className={`py-2 px-4 border rounded-xl border-lime ${
              poolMarket === '1' ? 'bg-lime text-black ' : ' '
            }`}
            onClick={() => setPoolMarket('1')}
          >
            Mode Native Market
          </button>
          <button
            className={`py-2 px-4 border rounded-xl border-lime ${
              poolMarket === '0' && selectedTab === 'BASE'
                ? 'bg-lime text-black '
                : ' '
            }`}
            onClick={() => (setPoolMarket('0'), setSelectedTab('BASE'))}
          >
            Base Market
          </button>
        </div> */}
        <div
          className={`lg:grid grid-cols-8 gap-x-3 my-2 w-full  font-semibold text-base `}
        >
          <div className={`col-span-4 flex flex-col`}>
            <div className={`  `}>
              {/* <Dropdown
            chainId={chain as string}
            dropdownSelectedChain={+chain}
            newRef={newRef}
            open={open}
            options={pools}
            pool={pool || '0'}
            setOpen={setOpen}
          /> */}
              <NetworkSelector dropdownSelectedChain={+chain} />
            </div>
          </div>
          {/* <div className={`w-full mt-2  col-span-5`}>
            <ClaimAllBaseRewards chain={+chain} />
          </div> */}
        </div>
        <div className={`bg-grayone  w-full px-6 py-3  rounded-xl`}>
          <PoolToggle
            chain={+chain}
            pool={pool}
          />
          <div className={` w-full flex items-center justify-between py-3 `}>
            <h1 className={`font-semibold`}>Your Collateral (Supply)</h1>
          </div>
          <ResultHandler
            center
            isLoading={
              isLoadingMarketData || isLoadingAssetsSupplyAprData
              // || isLoadingBorrowCaps
            }
          >
            <>
              {suppliedAssets.length > 0 ? (
                <>
                  <div
                    className={`w-full gap-x-1 hidden md:grid  grid-cols-5  py-4 text-[10px] text-white/40 font-semibold text-center  `}
                  >
                    <h3 className={` `}>SUPPLY ASSETS</h3>
                    <h3 className={` `}>AMOUNT</h3>
                    <h3 className={` `}>SUPPLY APR</h3>
                    <h3 className={` `}>REWARDS</h3>
                  </div>

                  {suppliedAssets.map((asset) => (
                    <InfoRows
                      amount={`${
                        asset.supplyBalanceNative
                          ? Number.parseFloat(
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
                            asset?.supplyRatePerBlock ?? 0n,
                            getBlockTimePerMinuteByChainId(+chain)
                          )
                          .toFixed(2) ?? '0.00'
                      }`}
                      asset={asset.underlyingSymbol}
                      collateralApr={`${
                        assetsSupplyAprData
                          ? assetsSupplyAprData[asset.cToken]?.apy.toFixed(2)
                          : ''
                      }%`}
                      cToken={asset.cToken}
                      key={`supply-row-${asset.underlyingSymbol}`}
                      logo={`/img/symbols/32/color/${asset.underlyingSymbol.toLowerCase()}.png`}
                      membership={asset.membership}
                      mode={InfoMode.SUPPLY}
                      comptrollerAddress={
                        marketData?.comptroller ?? ('' as Address)
                      }
                      pool={pool}
                      rewards={
                        (rewards?.[asset?.cToken]?.map((r) => ({
                          ...r,
                          apy:
                            typeof r.apy !== 'undefined'
                              ? r.apy * 100
                              : undefined
                        })) as FlywheelReward[]) ?? []
                      }
                      selectedChain={+chain}
                      setActiveTab={setActiveTab}
                      setIsManageDialogOpen={setIsManageDialogOpen}
                      setSelectedSymbol={setSelectedSymbol}
                      // utilization={utilizations[i]}
                      toggler={async () => {
                        const result = await handleSwitchOriginChain(
                          +chain,
                          walletChain
                        );
                        if (result) {
                          swapToggle();
                        }
                      }}
                      setCollateralSwapFromAsset={() =>
                        setCollateralSwapFromAsset(asset)
                      }
                      utilization="0.00%"
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
              isLoadingMarketData || isLoadingAssetsSupplyAprData
              // || isLoadingBorrowCaps
            }
          >
            <>
              {borrowedAssets.length > 0 ? (
                <>
                  <div
                    className={`w-full gap-x-1 hidden md:grid  grid-cols-5  py-4 text-[10px] text-white/40 font-semibold text-center  `}
                  >
                    <h3 className={` `}>BORROW ASSETS</h3>
                    <h3 className={` `}>AMOUNT</h3>
                    <h3 className={` `}>BORROW APR</h3>
                    <h3 className={` `}>REWARDS</h3>
                  </div>

                  {borrowedAssets.map((asset) => (
                    <InfoRows
                      amount={`${
                        asset.borrowBalanceFiat
                          ? Number.parseFloat(
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
                            asset?.borrowRatePerBlock ?? 0n,
                            getBlockTimePerMinuteByChainId(+chain)
                          )
                          .toFixed(2) ?? '0.00'
                      }`}
                      asset={asset.underlyingSymbol}
                      collateralApr={`${
                        assetsSupplyAprData
                          ? assetsSupplyAprData[asset.cToken]?.apy.toFixed(2)
                          : ''
                      }%`}
                      cToken={asset.cToken}
                      comptrollerAddress={
                        marketData?.comptroller ?? ('' as Address)
                      }
                      pool={pool}
                      rewards={
                        (rewards?.[asset?.cToken]?.map((r) => ({
                          ...r,
                          apy:
                            typeof r.apy !== 'undefined'
                              ? r.apy * 100
                              : undefined
                        })) as FlywheelReward[]) ?? []
                      }
                      key={`supply-row-${asset.underlyingSymbol}`}
                      logo={`/img/symbols/32/color/${asset.underlyingSymbol.toLowerCase()}.png`}
                      membership={asset.membership}
                      mode={InfoMode.BORROW}
                      selectedChain={+chain}
                      setIsManageDialogOpen={setIsManageDialogOpen}
                      setActiveTab={setActiveTab}
                      setSelectedSymbol={setSelectedSymbol}
                      // utilization={utilizations[i]}
                      utilization="0.00%"
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

        <div className={`bg-grayone  w-full px-6 py-3 mt-3 rounded-xl`}>
          <div className={` w-full flex items-center justify-between py-3 `}>
            <h1 className={`font-semibold`}>Your Loops</h1>
          </div>

          <ResultHandler
            center
            isLoading={
              isLoadingPositions ||
              isLoadingPositionsInfo ||
              isLoadingUSDPrice ||
              isLoadingPositionLeverages
            }
          >
            <>
              {positions && positions.openPositions.length > 0 ? (
                <>
                  <div
                    className={`w-full gap-x-1 grid  grid-cols-6  py-4 text-[10px] text-white/40 font-semibold text-center  `}
                  >
                    <h3 className={` `}>LOOPED ASSETS</h3>
                    <h3 className={` `}>LOOP VALUE</h3>
                    <h3 className={` `}>BORROW</h3>
                    <h3 className={` `}>LOOPS</h3>
                    <h3 className={` `}>REWARDS</h3>
                  </div>

                  {positions?.openPositions.map((position, i) => {
                    const currentPositionInfo = positionsInfo
                      ? positionsInfo[position.address]
                      : undefined;

                    if (!currentPositionInfo) {
                      return <div key={`position-${i}`} />;
                    }

                    return (
                      <LoopRow
                        key={`position-${position.address}`}
                        currentPositionInfo={currentPositionInfo}
                        marketData={marketData ?? undefined}
                        position={position}
                        positionLeverage={positionLeverages?.[i] ?? undefined}
                        usdPrice={usdPrice ?? undefined}
                        setSelectedLoopBorrowData={setSelectedLoopBorrowData}
                        setSelectedSymbol={setSelectedSymbol}
                        setLoopOpen={setIsLoopDialogOpen}
                        chain={+chain}
                      />
                    );
                  })}
                </>
              ) : (
                <div className="text-center mx-auto py-2">
                  No assets looped!
                </div>
              )}
            </>
          </ResultHandler>
        </div>
      </div>

      {selectedMarketData && (
        <Loop
          borrowableAssets={loopData ? loopData[selectedMarketData.cToken] : []}
          isOpen={isLoopDialogOpen}
          setIsOpen={setIsLoopDialogOpen}
          comptrollerAddress={marketData?.comptroller ?? ('' as Address)}
          currentBorrowAsset={selectedLoopBorrowData}
          selectedCollateralAsset={selectedMarketData}
        />
      )}

      {selectedMarketData && marketData && (
        <ManageDialog
          isOpen={isManageDialogOpen}
          setIsOpen={setIsManageDialogOpen}
          comptrollerAddress={marketData.comptroller}
          activeTab={activeTab}
          selectedMarketData={selectedMarketData}
        />
      )}
    </>
  );
}
type LoopRowProps = {
  position: OpenPosition;
  currentPositionInfo: PositionInfo;
  usdPrice?: number;
  positionLeverage?: number;
  marketData?: PoolData;
  setSelectedLoopBorrowData: (asset?: MarketData) => void;
  setSelectedSymbol: (symbol: string) => void;
  setLoopOpen: (open: boolean) => void;
  chain: number;
};
const LoopRow = ({
  position,
  currentPositionInfo,
  usdPrice,
  positionLeverage,
  marketData,
  setSelectedLoopBorrowData,
  setSelectedSymbol,
  setLoopOpen,
  chain
}: LoopRowProps) => {
  return (
    <div
      className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2 gap-x-1 lg:grid grid-cols-6 py-4 text-xs text-white/80 font-semibold text-center items-center relative`}
      key={`position-${position.address}`}
    >
      <div className={`  flex gap-2 items-center justify-center mb-2 lg:mb-0`}>
        <img
          alt={position.address}
          className="h-7"
          src={`/img/symbols/32/color/${position.collateral.symbol.toLowerCase()}.png`}
        />
        <h3 className={` `}>{position.collateral.symbol}</h3>
        /
        <img
          alt={position.address}
          className="h-7"
          src={`/img/symbols/32/color/${position.borrowable.symbol.toLowerCase()}.png`}
        />
        <h3 className={` `}>{position.borrowable.symbol}</h3>
      </div>

      <h3 className={`mb-2 lg:mb-0`}>
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          POSITION VALUE:
        </span>
        {Number(
          formatUnits(
            currentPositionInfo.positionSupplyAmount,
            Number(position.collateral.underlyingDecimals)
          )
        ).toLocaleString('en-US', {
          maximumFractionDigits: 2
        })}{' '}
        / $
        {millify(
          Number(
            formatUnits(
              currentPositionInfo.positionSupplyAmount,
              Number(position.collateral.underlyingDecimals)
            )
          ) *
            ((usdPrice ?? 0) *
              Number(
                formatEther(
                  marketData?.assets.find(
                    (asset) =>
                      asset.underlyingSymbol === position.collateral.symbol
                  )?.underlyingPrice ?? 0n
                )
              ))
        )}
      </h3>

      <h3 className={`mb-2 lg:mb-0`}>
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          BORROW:
        </span>
        {Number(
          formatUnits(
            currentPositionInfo.debtAmount,
            position.borrowable.underlyingDecimals
          )
        ).toLocaleString('en-US', {
          maximumFractionDigits: 2
        })}{' '}
        / $
        {millify(
          Number(
            formatUnits(
              currentPositionInfo.debtAmount,
              position.borrowable.underlyingDecimals
            )
          ) *
            ((usdPrice ?? 0) *
              Number(
                formatEther(
                  marketData?.assets.find(
                    (asset) =>
                      asset.underlyingSymbol === position.borrowable.symbol
                  )?.underlyingPrice ?? 0n
                )
              ))
        )}
      </h3>

      <h3 className={`mb-2 lg:mb-0`}>
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          LOOPS:
        </span>

        {(Math.ceil(positionLeverage ? positionLeverage : 0) - 1).toFixed(1)}
      </h3>

      <LoopRewards
        positionAddress={position.address}
        poolChainId={chain}
        className="items-center justify-center"
      />

      <h3 className={`mb-2 lg:mb-0`}>
        <button
          className="w-full uppercase rounded-lg bg-accent text-black py-1.5 px-3"
          onClick={() => {
            setSelectedLoopBorrowData(
              marketData?.assets.find(
                (asset) => asset.underlyingSymbol === position.borrowable.symbol
              )
            );
            setSelectedSymbol(position.collateral.symbol);
            setLoopOpen(true);
          }}
        >
          Adjust / Close
        </button>
      </h3>
    </div>
  );
};
