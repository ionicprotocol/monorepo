/* eslint-disable @next/next/no-img-element */
'use client';

import { useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import { formatEther, formatUnits, parseEther } from 'viem';

import BorrowTable from '@ui/components/dashboards/BorrowTable';
import type { BorrowRowData } from '@ui/components/dashboards/BorrowTable';
import ClaimRewardPopover from '@ui/components/dashboards/ClaimRewardPopover';
import InfoSection from '@ui/components/dashboards/InfoSection';
import type { LoopRowData } from '@ui/components/dashboards/LoopTable';
import LoopTable from '@ui/components/dashboards/LoopTable';
import type { SupplyRowData } from '@ui/components/dashboards/SupplyTable';
import SupplyTable from '@ui/components/dashboards/SupplyTable';
import ManageDialog from '@ui/components/dialogs/ManageMarket';
import type { ActiveTab } from '@ui/components/dialogs/ManageMarket';
import NetworkSelector from '@ui/components/markets/NetworkSelector';
import { FLYWHEEL_TYPE_MAP, pools } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useCurrentLeverageRatios } from '@ui/hooks/leverage/useCurrentLeverageRatio';
import { usePositionsInfo } from '@ui/hooks/leverage/usePositionInfo';
import { usePositionsQuery } from '@ui/hooks/leverage/usePositions';
import { usePositionsSupplyApy } from '@ui/hooks/leverage/usePositionsSupplyApy';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useLoopMarkets } from '@ui/hooks/useLoopMarkets';
import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import { useRewards } from '@ui/hooks/useRewards';
import { useUsdPrice } from '@ui/hooks/useUsdPrices';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

import type { FlywheelReward, OpenPosition } from '@ionicprotocol/types';

const PoolToggle = dynamic(() => import('@ui/components/markets/PoolToggle'), {
  ssr: false
});

interface TableSectionProps {
  title: string;
  children: React.ReactNode;
}

const TableSection: React.FC<TableSectionProps> = ({ title, children }) => {
  return (
    <div className="bg-grayone w-full px-6 py-3 mt-3 rounded-xl">
      <div className="w-full flex items-center justify-between py-3">
        <h1 className="font-semibold">{title}</h1>
      </div>
      {children}
    </div>
  );
};

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
  const { data: usdPrice, isLoading: isLoadingUSDPrice } = useUsdPrice(chain);

  const {
    componentRef: rewardRef,
    isopen: rewardisopen,
    toggle: rewardToggle
  } = useOutsideClick();

  const allChains: number[] = Object.keys(pools).map(Number);

  const borrowTableData: BorrowRowData[] = borrowedAssets.map((asset) => {
    const baseApr = Number(
      currentSdk
        ?.ratePerBlockToAPY(
          asset?.borrowRatePerBlock ?? 0n,
          getBlockTimePerMinuteByChainId(+chain)
        )
        .toFixed(2)
    );

    const rewardsData =
      (rewards?.[asset?.cToken]?.map((r) => ({
        ...r,
        apy: typeof r.apy !== 'undefined' ? r.apy * 100 : undefined
      })) as FlywheelReward[]) ?? [];

    const borrowRewards = rewardsData?.filter((reward) =>
      FLYWHEEL_TYPE_MAP[+chain]?.borrow?.includes(
        (reward as FlywheelReward).flywheel
      )
    );

    const totalRewardsApr = borrowRewards.reduce(
      (acc, reward) => acc + (reward.apy ?? 0),
      0
    );

    // For borrow APR, we subtract the base APR and add rewards
    const totalApr = 0 - baseApr + totalRewardsApr;

    return {
      asset: asset.underlyingSymbol,
      logo: `/img/symbols/32/color/${asset.underlyingSymbol.toLowerCase()}.png`,
      amount: {
        tokens: formatUnits(asset.borrowBalance, asset.underlyingDecimals),
        usd: asset.borrowBalanceFiat
      },
      apr: {
        base: baseApr,
        rewards: borrowRewards,
        total: totalApr
      },
      cToken: asset.cToken,
      membership: asset.membership,
      comptrollerAddress: marketData?.comptroller ?? '0x',
      pool,
      selectedChain: +chain,
      underlyingToken: asset.underlyingToken
    };
  });

  const supplyTableData: SupplyRowData[] = suppliedAssets.map((asset) => {
    const baseApr = Number(
      currentSdk
        ?.ratePerBlockToAPY(
          asset?.supplyRatePerBlock ?? 0n,
          getBlockTimePerMinuteByChainId(+chain)
        )
        .toFixed(2)
    );

    const rewardsData =
      (rewards?.[asset?.cToken]?.map((r) => ({
        ...r,
        apy: typeof r.apy !== 'undefined' ? r.apy * 100 : undefined
      })) as FlywheelReward[]) ?? [];

    const supplyRewards = rewardsData?.filter((reward) =>
      FLYWHEEL_TYPE_MAP[+chain]?.supply?.includes(
        (reward as FlywheelReward).flywheel
      )
    );

    const totalRewardsApr = supplyRewards.reduce(
      (acc, reward) => acc + (reward.apy ?? 0),
      0
    );

    const totalApr = baseApr + totalRewardsApr;

    return {
      asset: asset.underlyingSymbol,
      logo: `/img/symbols/32/color/${asset.underlyingSymbol.toLowerCase()}.png`,
      amount: {
        tokens: formatUnits(asset.supplyBalance, asset.underlyingDecimals),
        usd: asset.supplyBalanceFiat
      },
      apr: {
        base: baseApr,
        rewards: supplyRewards,
        total: totalApr
      },
      cToken: asset.cToken,
      membership: asset.membership,
      comptrollerAddress: marketData?.comptroller ?? '0x',
      pool,
      selectedChain: +chain,
      underlyingToken: asset.underlyingToken
    };
  });

  const loopTableData = positions?.openPositions
    ?.map((position, i) => {
      if (
        !position ||
        !position.address ||
        !position.collateral?.symbol ||
        !position.borrowable?.symbol ||
        !positionsInfo?.[position.address]
      ) {
        return null;
      }

      const currentPositionInfo = positionsInfo[position.address];
      const collateralPrice = Number(
        formatEther(
          marketData?.assets.find(
            (asset) => asset.underlyingSymbol === position.collateral.symbol
          )?.underlyingPrice ?? 0n
        )
      );
      const borrowablePrice = Number(
        formatEther(
          marketData?.assets.find(
            (asset) => asset.underlyingSymbol === position.borrowable.symbol
          )?.underlyingPrice ?? 0n
        )
      );

      return {
        position: {
          address: position.address,
          collateral: {
            symbol: position.collateral.symbol,
            logo: `/img/symbols/32/color/${position.collateral.symbol.toLowerCase()}.png`,
            amount: {
              tokens: Number(
                formatUnits(
                  currentPositionInfo.positionSupplyAmount,
                  Number(position.collateral.underlyingDecimals)
                )
              ),
              usd:
                Number(
                  formatUnits(
                    currentPositionInfo.positionSupplyAmount,
                    Number(position.collateral.underlyingDecimals)
                  )
                ) *
                ((usdPrice ?? 0) * collateralPrice)
            },
            underlyingDecimals: Number(position.collateral.underlyingDecimals)
          },
          borrowable: {
            symbol: position.borrowable.symbol,
            logo: `/img/symbols/32/color/${position.borrowable.symbol.toLowerCase()}.png`,
            amount: {
              tokens: Number(
                formatUnits(
                  currentPositionInfo.debtAmount,
                  position.borrowable.underlyingDecimals
                )
              ),
              usd:
                Number(
                  formatUnits(
                    currentPositionInfo.debtAmount,
                    position.borrowable.underlyingDecimals
                  )
                ) *
                ((usdPrice ?? 0) * borrowablePrice)
            },
            underlyingDecimals: Number(position.borrowable.underlyingDecimals)
          }
        },
        loops: Math.ceil(positionLeverages?.[i] ? positionLeverages[i] : 0)
      };
    })
    .filter((position) => !!position);

  return (
    <>
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
          <SupplyTable
            data={supplyTableData}
            isLoading={isLoadingMarketData}
            setIsManageDialogOpen={setIsManageDialogOpen}
            setActiveTab={setActiveTab}
            setSelectedSymbol={setSelectedSymbol}
            allMarketData={marketData?.assets}
            comptroller={marketData?.comptroller}
            pool={pool}
            chain={+chain}
          />
        </div>

        <TableSection title="Your Borrows (Loans)">
          <BorrowTable
            data={borrowTableData}
            isLoading={isLoadingMarketData}
            setIsManageDialogOpen={setIsManageDialogOpen}
            setActiveTab={setActiveTab}
            setSelectedSymbol={setSelectedSymbol}
          />
        </TableSection>

        <TableSection title="Your Loops">
          <LoopTable
            data={loopTableData as LoopRowData[]}
            isLoading={
              isLoadingPositions ||
              isLoadingPositionsInfo ||
              isLoadingUSDPrice ||
              isLoadingPositionLeverages
            }
            setSelectedSymbol={setSelectedSymbol}
            setSelectedLoopBorrowData={setSelectedLoopBorrowData}
            setLoopOpen={setIsLoopDialogOpen}
            chain={+chain}
            marketData={marketData?.assets}
            loopOpen={isLoopDialogOpen}
            loopData={loopData}
            selectedMarketData={selectedMarketData}
            comptroller={marketData?.comptroller}
            selectedLoopBorrowData={selectedLoopBorrowData}
          />
        </TableSection>
      </div>

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
