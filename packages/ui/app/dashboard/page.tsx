/* eslint-disable @next/next/no-img-element */
'use client';

import { useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import millify from 'millify';
import { type Address, formatEther, formatUnits, parseEther } from 'viem';
import { useChainId } from 'wagmi';

import ClaimRewardPopover from '@ui/components/dashboards/ClaimRewardPopover';
import CollateralSwapPopup from '@ui/components/dashboards/CollateralSwapPopup';
import InfoRows, { InfoMode } from '@ui/components/dashboards/InfoRows';
import InfoSection from '@ui/components/dashboards/InfoSection';
import LoopRewards from '@ui/components/dashboards/LoopRewards';
import Loop from '@ui/components/dialogs/loop';
import ManageDialog from '@ui/components/dialogs/manage';
import type { ActiveTab } from '@ui/components/dialogs/manage';
import NetworkSelector from '@ui/components/markets/NetworkSelector';
import ResultHandler from '@ui/components/ResultHandler';
import { NO_COLLATERAL_SWAP, pools } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useCurrentLeverageRatios } from '@ui/hooks/leverage/useCurrentLeverageRatio';
import { usePositionsInfo } from '@ui/hooks/leverage/usePositionInfo';
import { usePositionsQuery } from '@ui/hooks/leverage/usePositions';
import { usePositionsSupplyApy } from '@ui/hooks/leverage/usePositionsSupplyApy';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useLoopMarkets } from '@ui/hooks/useLoopMarkets';
import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import { useRewards } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

import type {
  FlywheelReward,
  OpenPosition,
  PositionInfo
} from '@ionicprotocol/types';

const PoolToggle = dynamic(() => import('@ui/components/markets/PoolToggle'), {
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

  const { data: rewards } = useRewards({
    chainId: +chain,
    poolId: pool
  });

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
      positions?.openPositions
        ?.filter(
          (p): p is OpenPosition =>
            !!p &&
            !!p.address &&
            typeof p.address === 'string' &&
            p.address.startsWith('0x')
        )
        ?.map((position) => position.address as `0x${string}`) ?? [],
      positions?.openPositions?.map((position) =>
        collateralsAPR &&
        position?.collateral?.cToken &&
        collateralsAPR[position.collateral.cToken] !== undefined
          ? parseEther(
              collateralsAPR[position.collateral.cToken].totalApy.toFixed(18)
            )
          : null
      ) ?? [],
      positions?.openPositions?.map((p) => p?.chainId ?? chain) ?? []
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
  const { data: usdPrice, isLoading: isLoadingUSDPrice } = useUsdPrice(
    chain.toString()
  );

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

  const allChains: number[] = Object.keys(pools).map(Number);

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
      <div className="w-full flex flex-col items-start justify-start transition-all duration-200 ease-linear gap-3">
        <InfoSection
          marketData={marketData}
          isLoadingMarketData={isLoadingMarketData}
          rewardToggle={rewardToggle}
          suppliedAssets={suppliedAssets}
          borrowedAssets={borrowedAssets}
          chain={+chain}
        />
        <NetworkSelector dropdownSelectedChain={+chain} />
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

                  {positions?.openPositions
                    ?.filter(Boolean)
                    .map((position, i) => {
                      if (
                        !position ||
                        !position.address ||
                        typeof position.address !== 'string'
                      ) {
                        console.warn('Invalid position:', position);
                        return null;
                      }

                      const isValidAddress =
                        position?.address &&
                        typeof position.address === 'string' &&
                        position.address.startsWith('0x');

                      const currentPositionInfo =
                        isValidAddress && positionsInfo
                          ? positionsInfo[position.address]
                          : undefined;

                      if (!isValidAddress) {
                        console.warn(
                          'Invalid position address format:',
                          position?.address
                        );
                        return null;
                      }

                      if (!currentPositionInfo) {
                        console.warn(
                          'Missing position info for address:',
                          position?.address
                        );
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
  if (
    !position ||
    !position.address ||
    !position.collateral?.symbol ||
    !position.borrowable?.symbol ||
    !currentPositionInfo
  ) {
    console.warn('Missing required data for LoopRow:', {
      hasPosition: !!position,
      address: position?.address,
      collateralSymbol: position?.collateral?.symbol,
      borrowableSymbol: position?.borrowable?.symbol,
      hasCurrentPositionInfo: !!currentPositionInfo
    });
    return null;
  }

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
        positionAddress={position.address ?? '0x'}
        poolChainId={chain}
        className="items-center justify-center"
      />

      <h3 className={`ml-2 mb-2 lg:mb-0`}>
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
