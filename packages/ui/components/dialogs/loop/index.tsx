'use client';

import React, { useEffect, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { getQuote } from '@lifi/sdk';
import { useQueryClient } from '@tanstack/react-query';
import millify from 'millify';
import {
  type Hex,
  type Address,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
  zeroAddress
} from 'viem';
import {
  useBalance,
  useChainId,
  usePublicClient,
  useWalletClient
} from 'wagmi';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { INFO_MESSAGES } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useCurrentLeverageRatio } from '@ui/hooks/leverage/useCurrentLeverageRatio';
import { useGetNetApy } from '@ui/hooks/leverage/useGetNetApy';
import { useGetPositionBorrowApr } from '@ui/hooks/leverage/useGetPositionBorrowApr';
import { usePositionInfo } from '@ui/hooks/leverage/usePositionInfo';
import { usePositionsQuery } from '@ui/hooks/leverage/usePositions';
import { usePositionsSupplyApy } from '@ui/hooks/leverage/usePositionsSupplyApy';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useUsdPrice } from '@ui/hooks/useUsdPrices';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getScanUrlByChainId } from '@ui/utils/networkData';

import BorrowActions from './BorrowActions';
import LoopHealthRatioDisplay from './LoopHealthRatioDisplay';
import LoopInfoDisplay from './LoopInfoDisplay';
import SupplyActions from './SupplyActions';
import ResultHandler from '../../ResultHandler';
import TransactionStepsHandler, {
  useTransactionSteps
} from '../ManageMarket/TransactionStepsHandler';

import {
  icErc20Abi,
  iLeveredPositionFactoryAbi,
  leveredPositionAbi,
  leveredPositionWithAggregatorSwapsAbi
} from '@ionicprotocol/sdk';
import type { OpenPosition } from '@ionicprotocol/types';

const SwapWidget = dynamic(() => import('../../markets/SwapWidget'), {
  ssr: false
});

export type LoopProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  borrowableAssets: Address[];
  comptrollerAddress: Address;
  currentBorrowAsset?: MarketData;
  selectedCollateralAsset: MarketData;
};

export default function Loop({
  isOpen,
  setIsOpen,
  borrowableAssets,
  comptrollerAddress,
  currentBorrowAsset,
  selectedCollateralAsset
}: LoopProps) {
  const chainId = useChainId();
  const [amount, setAmount] = useState<string>();
  const amountAsBInt = useMemo<bigint>(
    () => parseUnits(amount ?? '0', selectedCollateralAsset.underlyingDecimals),
    [amount, selectedCollateralAsset]
  );
  const [swapWidgetOpen, setSwapWidgetOpen] = useState(false);
  const { data: marketData } = useFusePoolData('0', chainId, true);
  const { data: usdPrice } = useUsdPrice(chainId.toString());
  const [selectedBorrowAsset, setSelectedBorrowAsset] = useState<
    MarketData | undefined
  >(currentBorrowAsset);
  const { data: positions, refetch: refetchPositions } =
    usePositionsQuery(chainId);
  const currentPosition = useMemo<OpenPosition | undefined>(() => {
    return positions?.openPositions.find(
      (position) =>
        position.borrowable.underlyingToken ===
          selectedBorrowAsset?.underlyingToken &&
        position.collateral.underlyingToken ===
          selectedCollateralAsset.underlyingToken &&
        !position.isClosed
    );
  }, [positions, selectedBorrowAsset, selectedCollateralAsset]);
  const { data: currentPositionLeverageRatio } = useCurrentLeverageRatio(
    currentPosition?.address ?? ('' as Address),
    chainId
  );
  const collateralsAPR = usePositionsSupplyApy(
    positions?.openPositions.map((position) => position.collateral) ?? [],
    positions?.openPositions.map((position) => position.chainId) ?? []
  );
  const {
    data: positionInfo,
    isFetching: isFetchingPositionInfo,
    refetch: refetchPositionInfo
  } = usePositionInfo(
    currentPosition?.address ?? ('' as Address),
    collateralsAPR &&
      collateralsAPR[selectedCollateralAsset.cToken] !== undefined
      ? parseEther(
          collateralsAPR[selectedCollateralAsset.cToken].totalApy.toFixed(18)
        )
      : undefined,
    chainId
  );
  const { data: positionNetApy, isFetching: isFetchingPositionNetApy } =
    useGetNetApy(
      selectedCollateralAsset.cToken,
      selectedBorrowAsset?.cToken ?? ('' as Address),
      positionInfo?.equityAmount,
      currentPositionLeverageRatio,
      collateralsAPR &&
        collateralsAPR[selectedCollateralAsset.cToken] !== undefined
        ? parseEther(
            collateralsAPR[selectedCollateralAsset.cToken].totalApy.toFixed(18)
          )
        : undefined,
      chainId
    );
  const [currentLeverage, setCurrentLeverage] = useState<number>(2);
  const { data: borrowApr } = useGetPositionBorrowApr({
    amount: amountAsBInt,
    borrowMarket: selectedBorrowAsset?.cToken ?? ('' as Address),
    collateralMarket: selectedCollateralAsset.cToken,
    leverage: parseEther(currentLeverage.toString())
  });

  const {
    borrowedAssetAmount,
    borrowedToCollateralRatio,
    positionValueMillified,
    projectedHealthRatio,
    liquidationValue,
    healthRatio,
    projectedCollateral,
    projectedBorrowAmount,
    projectedCollateralValue,
    selectedBorrowAssetUSDPrice,
    selectedCollateralAssetUSDPrice
  } = useMemo(() => {
    const selectedCollateralAssetUSDPrice =
      (usdPrice ?? 0) *
      parseFloat(formatEther(selectedCollateralAsset.underlyingPrice));
    const selectedBorrowAssetUSDPrice =
      usdPrice && selectedBorrowAsset
        ? (usdPrice ?? 0) *
          parseFloat(formatEther(selectedBorrowAsset.underlyingPrice))
        : 0;
    const positionValue =
      Number(formatEther(positionInfo?.positionSupplyAmount ?? 0n)) *
      (selectedCollateralAssetUSDPrice ?? 0);
    const liquidationValue =
      positionValue * Number(formatEther(positionInfo?.safetyBuffer ?? 0n));
    const healthRatio = positionValue / liquidationValue - 1;
    const borrowedToCollateralRatio =
      selectedBorrowAssetUSDPrice / selectedCollateralAssetUSDPrice;
    const borrowedAssetAmount = Number(
      formatUnits(
        positionInfo?.debtAmount ?? 0n,
        currentPosition?.borrowable.underlyingDecimals ?? 18
      )
    );
    const projectedCollateral = formatUnits(
      positionInfo?.equityAmount ?? 0n + amountAsBInt,
      selectedCollateralAsset.underlyingDecimals
    );
    const projectedCollateralValue =
      Number(projectedCollateral) * selectedCollateralAssetUSDPrice;
    const projectedBorrowAmount =
      (Number(projectedCollateral) / borrowedToCollateralRatio) *
      (currentLeverage - 1);
    const projectedHealthRatio = currentPosition
      ? (projectedCollateralValue +
          projectedBorrowAmount * selectedBorrowAssetUSDPrice) /
          liquidationValue -
        1
      : undefined;

    return {
      borrowedAssetAmount,
      borrowedToCollateralRatio,
      healthRatio,
      liquidationValue,
      positionValue,
      positionValueMillified: `${millify(positionValue)}`,
      projectedBorrowAmount,
      projectedCollateral,
      projectedCollateralValue,
      projectedHealthRatio,
      selectedBorrowAssetUSDPrice,
      selectedCollateralAssetUSDPrice
    };
  }, [
    amountAsBInt,
    currentLeverage,
    currentPosition,
    selectedBorrowAsset,
    selectedCollateralAsset,
    positionInfo,
    usdPrice
  ]);
  const { currentSdk, address } = useMultiIonic();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();
  const { refetch: refetchBalance } = useBalance({
    address,
    token: selectedCollateralAsset.underlyingToken as `0x${string}`
  });
  const queryClient = useQueryClient();

  /**
   * Force new borrow asset
   * when currentBorrowAsset
   * is present
   */
  useEffect(() => {
    if (currentBorrowAsset && isOpen) {
      setSelectedBorrowAsset(currentBorrowAsset);
    }
  }, [currentBorrowAsset, isOpen]);

  /**
   * Update selected borrow asset
   * when market data loads
   */
  useEffect(() => {
    if (!selectedBorrowAsset && marketData) {
      setSelectedBorrowAsset(
        marketData.assets.filter((asset) =>
          borrowableAssets.find(
            (borrowableAsset) => borrowableAsset === asset.cToken
          )
        )[0]
      );
    }
  }, [borrowableAssets, marketData, selectedBorrowAsset]);

  /**
   * Reset neccessary queries after actions
   */
  const resetQueries = async (): Promise<void> => {
    queryClient.invalidateQueries({ queryKey: ['useCurrentLeverageRatio'] });
    queryClient.invalidateQueries({ queryKey: ['useGetNetApy'] });
    queryClient.invalidateQueries({ queryKey: ['usePositionInfo'] });
    queryClient.invalidateQueries({ queryKey: ['positions'] });
    queryClient.invalidateQueries({ queryKey: ['useMaxSupplyAmount'] });
    await refetchBalance();
    await refetchPositionInfo();
    await refetchPositions();
  };

  /**
   * Handle position opening
   */
  const handleOpenPosition = async (): Promise<void> => {
    if (
      !currentSdk ||
      !address ||
      !publicClient ||
      !walletClient ||
      !selectedBorrowAsset
    ) {
      return;
    }

    let currentTransactionStep = 0;

    addStepsForAction([
      {
        error: false,
        message: INFO_MESSAGES.OPEN_POSITION.APPROVE,
        success: false
      },
      {
        error: false,
        message: INFO_MESSAGES.OPEN_POSITION.OPENING,
        success: false
      }
    ]);

    try {
      const token = currentSdk.getEIP20TokenInstance(
        selectedCollateralAsset.underlyingToken,
        currentSdk.publicClient as any
      );
      const factory = currentSdk.createLeveredPositionFactory();
      const hasApprovedEnough =
        (await token.read.allowance([address, factory.address])) >=
        amountAsBInt;

      if (!hasApprovedEnough) {
        const tx = await currentSdk.approve(
          factory.address,
          selectedCollateralAsset.underlyingToken,
          amountAsBInt
        );

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx
          }
        });

        await currentSdk.publicClient.waitForTransactionReceipt({ hash: tx });
      }

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });

      currentTransactionStep++;

      const previewDeposit = await publicClient.readContract({
        abi: icErc20Abi,
        address: selectedCollateralAsset.cToken,
        functionName: 'previewDeposit',
        args: [amountAsBInt]
      });

      const actualRedeemedAmountForAggregatorSwap =
        await publicClient.readContract({
          abi: icErc20Abi,
          address: selectedCollateralAsset.cToken,
          functionName: 'previewRedeem',
          args: [previewDeposit]
        });

      // get initial quote to calculate slippage
      const [, initialBorrowAmount] = await publicClient.readContract({
        abi: iLeveredPositionFactoryAbi,
        address: factory.address,
        functionName: 'calculateAdjustmentAmountDeltas',
        args: [
          parseEther(currentLeverage.toString()),
          selectedCollateralAsset.underlyingPrice,
          selectedBorrowAsset!.underlyingPrice,
          1n,
          actualRedeemedAmountForAggregatorSwap,
          0n
        ]
      });

      const quote = await getQuote({
        fromChain: chainId,
        toChain: chainId,
        fromToken: selectedBorrowAsset!.underlyingToken,
        toToken: selectedCollateralAsset.underlyingToken,
        fromAmount: initialBorrowAmount.toString(),
        fromAddress: factory.address
      });
      let realSlippage =
        quote.estimate.toAmountUSD && quote.estimate.fromAmountUSD
          ? 1 -
            Number(quote.estimate.toAmountUSD) /
              Number(quote.estimate.fromAmountUSD)
          : 0;
      if (realSlippage < 0.001) realSlippage = 0.001;
      const slippageWithBuffer = realSlippage * 1.1;
      const slippageWithBufferScaled = BigInt(Math.round(slippageWithBuffer * 10000));

      const [, finalBorrowAmount] = await publicClient.readContract({
        abi: iLeveredPositionFactoryAbi,
        address: factory.address,
        functionName: 'calculateAdjustmentAmountDeltas',
        args: [
          parseEther(currentLeverage.toString()),
          selectedCollateralAsset.underlyingPrice,
          selectedBorrowAsset!.underlyingPrice,
          slippageWithBufferScaled,
          actualRedeemedAmountForAggregatorSwap,
          0n
        ]
      });

      const result = await publicClient.simulateContract({
        abi: iLeveredPositionFactoryAbi,
        address: factory.address,
        functionName: 'createPosition',
        args: [selectedCollateralAsset.cToken, selectedBorrowAsset!.cToken]
      });
      if (!result.result) {
        throw new Error('Error while creating position');
      }

      const quoteFinal = await getQuote({
        fromChain: chainId,
        toChain: chainId,
        fromToken: selectedBorrowAsset!.underlyingToken,
        toToken: selectedCollateralAsset.underlyingToken,
        fromAmount: finalBorrowAmount.toString(),
        fromAddress: result.result,
        slippage: slippageWithBuffer
      });

      const tx = await walletClient?.writeContract({
        abi: iLeveredPositionFactoryAbi,
        address: factory.address,
        functionName: 'createAndFundPositionWithAggregatorSwapsAtRatio',
        args: [
          selectedCollateralAsset.cToken,
          selectedBorrowAsset!.cToken,
          selectedCollateralAsset.underlyingToken,
          amountAsBInt,
          parseEther(currentLeverage.toString()),
          zeroAddress,
          '0x',
          quoteFinal.transactionRequest!.to! as Address,
          quoteFinal.transactionRequest!.data! as Hex
        ]
      });

      // const tx = await currentSdk.createAndFundPositionAtRatio(
      //   selectedCollateralAsset.cToken,
      //   selectedBorrowAsset?.cToken ?? ('' as Address),
      //   selectedCollateralAsset.underlyingToken,
      //   amountAsBInt,
      //   parseEther(currentLeverage.toString())
      // );

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          txHash: tx
        }
      });

      await currentSdk.publicClient.waitForTransactionReceipt({ hash: tx });
      await refetchPositions();
      setAmount('0');

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });
    } catch (error) {
      console.error(error);

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          error: true
        }
      });
    }
  };

  /**
   * Handle leverage adjustment
   */
  const handleLeverageAdjustment = async (): Promise<void> => {
    if (
      !publicClient ||
      !walletClient ||
      !currentSdk ||
      !currentPosition ||
      !currentPositionLeverageRatio
    ) {
      return;
    }
    const currentTransactionStep = 0;
    const factory = currentSdk.createLeveredPositionFactory();

    addStepsForAction([
      {
        error: false,
        message: INFO_MESSAGES.ADJUST_LEVERAGE.ADJUSTING,
        success: false
      }
    ]);

    let upOrDown: 'down' | 'up' = 'up';
    if (currentPositionLeverageRatio > currentLeverage) {
      upOrDown = 'down';
    }

    try {
      // get initial quote to calculate slippage
      const [initialSupplyAmount, initialBorrowAmount] =
        await publicClient.readContract({
          abi: leveredPositionAbi,
          address: currentPosition.address,
          functionName: 'getAdjustmentAmountDeltas',
          args: [parseEther(currentLeverage.toString()), 1n]
        });
      const quote = await getQuote({
        fromChain: chainId,
        toChain: chainId,
        fromToken:
          upOrDown === 'up'
            ? selectedBorrowAsset!.underlyingToken
            : selectedCollateralAsset.underlyingToken,
        toToken:
          upOrDown === 'up'
            ? selectedCollateralAsset.underlyingToken
            : selectedBorrowAsset!.underlyingToken,
        fromAmount:
          upOrDown === 'up'
            ? initialBorrowAmount.toString()
            : initialSupplyAmount.toString(),
        fromAddress: factory.address
      });
      let realSlippage =
        quote.estimate.toAmountUSD && quote.estimate.fromAmountUSD
          ? 1 -
            Number(quote.estimate.toAmountUSD) /
              Number(quote.estimate.fromAmountUSD)
          : 0;
      if (realSlippage < 0.001) realSlippage = 0.001;
      const slippageWithBuffer = realSlippage * 1.1;
      const slippageWithBufferScaled = BigInt(Math.round(slippageWithBuffer * 10000));

      const [finalSupplyAmount, finalBorrowAmount] =
        await publicClient.readContract({
          abi: leveredPositionAbi,
          address: currentPosition.address,
          functionName: 'getAdjustmentAmountDeltas',
          args: [
            parseEther(currentLeverage.toString()),
            slippageWithBufferScaled,
          ]
        });

      const quoteFinal = await getQuote({
        fromChain: chainId,
        toChain: chainId,
        fromToken:
          upOrDown === 'up'
            ? selectedBorrowAsset!.underlyingToken
            : selectedCollateralAsset.underlyingToken,
        toToken:
          upOrDown === 'up'
            ? selectedCollateralAsset.underlyingToken
            : selectedBorrowAsset!.underlyingToken,
        fromAmount:
          upOrDown === 'up'
            ? finalBorrowAmount.toString()
            : finalSupplyAmount.toString(),
        fromAddress: currentPosition.address,
        slippage: slippageWithBuffer
      });

      let tx;
      if (upOrDown === 'up') {
        tx = await walletClient?.writeContract({
          abi: leveredPositionWithAggregatorSwapsAbi,
          address: currentPosition.address,
          functionName: 'increaseLeverageRatio',
          args: [
            finalSupplyAmount,
            finalBorrowAmount,
            quoteFinal.transactionRequest!.to! as Address,
            quoteFinal.transactionRequest!.data! as Hex
          ]
        });
      } else {
        tx = await walletClient?.writeContract({
          abi: leveredPositionWithAggregatorSwapsAbi,
          address: currentPosition.address,
          functionName: 'decreaseLeverageRatio',
          args: [
            finalSupplyAmount,
            finalBorrowAmount,
            quoteFinal.transactionRequest!.to! as Address,
            quoteFinal.transactionRequest!.data! as Hex
          ]
        });
      }

      if (!tx) {
        throw new Error('Error while adjusting leverage');
      }

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          txHash: tx
        }
      });

      await currentSdk?.publicClient.waitForTransactionReceipt({ hash: tx });
      await refetchPositions();
      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });
    } catch (error) {
      console.error(error);

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          error: true
        }
      });
    }
  };

  /**
   * Handle position funding
   */
  const handlePositionFunding = async (): Promise<void> => {
    if (!currentSdk || !address || !currentPosition) {
      return;
    }

    let currentTransactionStep = 0;

    addStepsForAction([
      {
        error: false,
        message: INFO_MESSAGES.FUNDING_POSITION.APPROVE,
        success: false
      },
      {
        error: false,
        message: INFO_MESSAGES.FUNDING_POSITION.FUNDING,
        success: false
      }
    ]);

    try {
      const token = currentSdk.getEIP20TokenInstance(
        selectedCollateralAsset.underlyingToken,
        currentSdk.walletClient as any
      );
      const hasApprovedEnough =
        (await token.read.allowance([address, currentPosition.address])) >=
        amountAsBInt;

      if (!hasApprovedEnough) {
        const tx = await currentSdk.approve(
          currentPosition.address,
          selectedCollateralAsset.underlyingToken,
          amountAsBInt
        );

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx
          }
        });

        await currentSdk.publicClient.waitForTransactionReceipt({ hash: tx });
      }

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });

      currentTransactionStep++;

      const tx = await currentSdk.fundPosition(
        currentPosition?.address ?? '',
        selectedCollateralAsset.underlyingToken,
        amountAsBInt
      );

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          txHash: tx
        }
      });

      await currentSdk.publicClient.waitForTransactionReceipt({ hash: tx });

      setAmount('0');
      await refetchPositions();
      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });
    } catch (error) {
      console.error(error);

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          error: true
        }
      });
    }
  };

  /**
   * Handle position closing
   */
  const handleClosePosition = async (): Promise<void> => {
    if (!publicClient || !currentSdk || !currentPosition) {
      return;
    }
    const currentTransactionStep = 0;
    const factory = currentSdk.createLeveredPositionFactory();

    addStepsForAction([
      {
        error: false,
        message: INFO_MESSAGES.CLOSE_POSITION.CLOSING,
        success: false
      }
    ]);

    try {
      // get initial quote to calculate slippage
      const [initialSupplyAmount] = await publicClient.readContract({
        abi: leveredPositionAbi,
        address: currentPosition.address,
        functionName: 'getAdjustmentAmountDeltas',
        args: [parseEther('1'), 1n]
      });

      const quote = await getQuote({
        fromChain: chainId,
        toChain: chainId,
        fromToken: selectedCollateralAsset.underlyingToken,
        toToken: selectedBorrowAsset!.underlyingToken,
        fromAmount: initialSupplyAmount.toString(),
        fromAddress: factory.address
      });
      let realSlippage =
        quote.estimate.toAmountUSD && quote.estimate.fromAmountUSD
          ? 1 -
            Number(quote.estimate.toAmountUSD) /
              Number(quote.estimate.fromAmountUSD)
          : 0;
      if (realSlippage < 0.001) realSlippage = 0.001;
      const slippageWithBuffer = realSlippage * 1.1;
      const slippageWithBufferScaled = BigInt(Math.round(slippageWithBuffer * 10000));

      const [finalSupplyAmount, finalBorrowsAmount] =
        await publicClient.readContract({
          abi: leveredPositionAbi,
          address: currentPosition.address,
          functionName: 'getAdjustmentAmountDeltas',
          args: [
            parseEther('1'),
            slippageWithBufferScaled
          ]
        });

      const quoteFinal = await getQuote({
        fromChain: chainId,
        toChain: chainId,
        fromToken: selectedCollateralAsset.underlyingToken,
        toToken: selectedBorrowAsset!.underlyingToken,
        fromAmount: finalSupplyAmount.toString(),
        fromAddress: currentPosition.address,
        slippage: slippageWithBuffer
      });

      const tx = await currentSdk.closeLeveredPositionWithAggregator(
        currentPosition?.address ?? ('' as Address),
        finalSupplyAmount,
        finalBorrowsAmount,
        quoteFinal.transactionRequest!.to! as Address,
        quoteFinal.transactionRequest!.data! as Hex
      );

      if (!tx) {
        throw new Error('Error while closing position');
      }

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          txHash: tx
        }
      });

      await currentSdk?.publicClient.waitForTransactionReceipt({ hash: tx });

      await refetchPositions();

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });
    } catch (error) {
      console.error(error);

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          error: true
        }
      });
    }
  };

  /**
   * Handle transaction steps reset
   */
  const handleTransactionStepsReset = async (): Promise<void> => {
    resetQueries();
    upsertTransactionStep(undefined);
  };

  return (
    <>
      <SwapWidget
        close={() => setSwapWidgetOpen(false)}
        open={swapWidgetOpen}
        fromChain={chainId}
        toChain={chainId}
        toToken={selectedCollateralAsset.underlyingToken}
      />
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DialogContent
          maxWidth="800px"
          className="bg-grayUnselect max-h-[90vh] overflow-y-auto"
          fullWidth
        >
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center text-lg font-bold">
                <Image
                  alt=""
                  className="mr-2"
                  height="20"
                  src={`/img/symbols/32/color/${selectedCollateralAsset.underlyingSymbol.toLowerCase()}.png`}
                  width="20"
                />
                {selectedCollateralAsset.underlyingSymbol}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex mb-4 items-center text-sm font-bold">
            {currentPosition
              ? `Loop Position Found: `
              : 'No Loop Position Found, Create a New One'}
            {currentPosition && (
              <a
                href={`${getScanUrlByChainId(chainId)}/address/${currentPosition.address}`}
                target="_blank"
                className="text-cyan-400 pl-2"
              >
                0x{currentPosition.address.slice(2, 4)}...
                {currentPosition.address.slice(-6)}
              </a>
            )}
          </div>
          <button
            className={`w-full font-bold uppercase rounded-md py-1 transition-colors bg-accent text-darkone text-xs mx-auto mb-4`}
            onClick={() => setSwapWidgetOpen(true)}
          >
            Get {selectedCollateralAsset.underlyingSymbol}
          </button>

          <div className="lg:flex justify-between items-center">
            <div className="grow-0 shrink-0 basis-[45%]">
              <div
                className={`flex w-full items-center justify-between mb-1 hint-text-uppercase `}
              >
                <span className={``}>Position Value</span>
                <ResultHandler
                  height="20"
                  isLoading={isFetchingPositionInfo}
                  width="20"
                >
                  <span className={`flex text-sm font-bold pl-2 text-white`}>
                    ${positionValueMillified}
                  </span>
                </ResultHandler>
              </div>
              <div
                className={`flex w-full items-center justify-between mb-1 hint-text-uppercase `}
              >
                <span className={``}>Net APR</span>
                <ResultHandler
                  height="20"
                  isLoading={isFetchingPositionNetApy}
                  width="20"
                >
                  <span className={`flex text-sm font-bold pl-2 text-white`}>
                    {positionNetApy?.toFixed(2) ?? '0.00'}%
                  </span>
                </ResultHandler>
              </div>

              {/* <div
                className={`flex w-full items-center justify-between mb-1 hint-text-uppercase `}
              >
                <span className={``}>Annual yield</span>
                <span className={`flex text-sm font-bold pl-2 text-white`}>
                  TODO
                </span>
              </div> */}
            </div>

            <div className={`separator lg:hidden`} />

            <div className="separator-vertical hidden lg:block" />

            <LoopHealthRatioDisplay
              currentValue={positionValueMillified}
              healthRatio={healthRatio}
              liquidationValue={millify(liquidationValue)}
              projectedHealthRatio={
                parseFloat(amount ?? '0') > 0 ||
                (!!currentPositionLeverageRatio &&
                  Math.round(currentPositionLeverageRatio) !== currentLeverage)
                  ? projectedHealthRatio
                  : undefined
              }
            />
          </div>

          <div className={`separator`} />

          <div className="md:flex justify-between items-center">
            <LoopInfoDisplay
              aprPercentage={`
                  ${
                    collateralsAPR &&
                    collateralsAPR[selectedCollateralAsset.cToken]
                      ? collateralsAPR[
                          selectedCollateralAsset.cToken
                        ].totalApy.toFixed(4)
                      : '0.00'
                  }
                  %
              `}
              aprText={'Collateral APR'}
              isLoading={
                isFetchingPositionInfo || typeof collateralsAPR === 'undefined'
              }
              nativeAmount={
                currentPosition
                  ? formatUnits(
                      positionInfo?.equityAmount ?? 0n,
                      Number(currentPosition.collateral.underlyingDecimals)
                    )
                  : '0'
              }
              symbol={selectedCollateralAsset.underlyingSymbol}
              title={'My Collateral'}
              usdAmount={
                currentPosition
                  ? millify(
                      Number(
                        formatUnits(
                          positionInfo?.equityAmount ?? 0n,
                          selectedCollateralAsset.underlyingDecimals
                        )
                      ) * selectedCollateralAssetUSDPrice
                    )
                  : '0'
              }
            />

            <div className="separator lg:hidden" />

            <div className="separator-vertical hidden lg:block" />

            <LoopInfoDisplay
              aprPercentage={`
                  ${Number(formatEther(borrowApr ?? 0n)).toFixed(2)}
                  %
              `}
              aprText={'Borrow APR'}
              isLoading={isFetchingPositionInfo}
              nativeAmount={borrowedAssetAmount.toFixed(
                selectedBorrowAsset?.underlyingDecimals ?? 18
              )}
              symbol={selectedBorrowAsset?.underlyingSymbol ?? ''}
              title={'My Borrow'}
              usdAmount={millify(
                borrowedAssetAmount * selectedBorrowAssetUSDPrice
              )}
            />
          </div>

          <div className="separator" />

          {currentPosition && (
            <>
              <div className="md:flex justify-between items-center">
                <LoopInfoDisplay
                  isLoading={isFetchingPositionInfo || !collateralsAPR}
                  nativeAmount={projectedCollateral}
                  symbol={selectedCollateralAsset.underlyingSymbol}
                  title={'Projected Collateral'}
                  usdAmount={millify(projectedCollateralValue)}
                />

                <div className="separator lg:hidden" />

                <div className="separator-vertical hidden lg:block" />

                <LoopInfoDisplay
                  isLoading={isFetchingPositionInfo}
                  nativeAmount={projectedBorrowAmount.toString() ?? '0'}
                  symbol={selectedBorrowAsset?.underlyingSymbol ?? ''}
                  title={'Projected Borrow'}
                  usdAmount={millify(
                    Number(projectedBorrowAmount) * selectedBorrowAssetUSDPrice
                  )}
                />
              </div>

              <div className="separator" />
            </>
          )}

          <div className="lg:flex justify-between items-center">
            <SupplyActions
              amount={amount}
              comptrollerAddress={comptrollerAddress}
              handleClosePosition={handleClosePosition}
              isClosingPosition={!!transactionSteps.length}
              selectedCollateralAsset={selectedCollateralAsset}
              selectedCollateralAssetUSDPrice={selectedCollateralAssetUSDPrice}
              setAmount={setAmount}
            />

            <div className="separator lg:hidden" />

            <div className="separator-vertical hidden lg:block" />

            <BorrowActions
              borrowAmount={(
                (parseFloat(amount ?? '0') / borrowedToCollateralRatio) *
                (currentLeverage - 1)
              ).toFixed(
                parseInt(
                  selectedBorrowAsset?.underlyingDecimals.toString() ?? '18'
                )
              )}
              borrowableAssets={borrowableAssets}
              currentLeverage={currentLeverage}
              currentPositionLeverage={
                currentPositionLeverageRatio
                  ? Math.round(currentPositionLeverageRatio)
                  : undefined
              }
              selectedBorrowAsset={selectedBorrowAsset}
              selectedBorrowAssetUSDPrice={selectedBorrowAssetUSDPrice}
              setCurrentLeverage={setCurrentLeverage}
              setSelectedBorrowAsset={setSelectedBorrowAsset}
            />
          </div>

          <div className="mt-4">
            <ResultHandler
              center
              height="32"
              isLoading={isFetchingPositionInfo}
            >
              <>
                {transactionSteps.length > 0 ? (
                  <div className="flex justify-center">
                    <TransactionStepsHandler
                      chainId={chainId}
                      resetTransactionSteps={handleTransactionStepsReset}
                      transactionSteps={transactionSteps}
                    />
                  </div>
                ) : (
                  <>
                    {currentPosition ? (
                      <div className="md:flex">
                        <button
                          className={`block w-full btn-green md:mr-6 uppercase`}
                          disabled={parseFloat(amount ?? '0') <= 0}
                          onClick={handlePositionFunding}
                        >
                          Fund position
                        </button>

                        <button
                          className={`block w-full btn-green mt-2 md:mt-0 md:ml-6 uppercase`}
                          disabled={
                            !!currentPositionLeverageRatio &&
                            Math.round(currentPositionLeverageRatio) ===
                              currentLeverage
                          }
                          onClick={handleLeverageAdjustment}
                        >
                          Adjust leverage
                        </button>
                      </div>
                    ) : (
                      <button
                        className={`block w-full btn-green uppercase`}
                        disabled={parseFloat(amount ?? '0') <= 0}
                        onClick={handleOpenPosition}
                      >
                        Loop
                      </button>
                    )}
                  </>
                )}
              </>
            </ResultHandler>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
