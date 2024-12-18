// tabs/SupplyTab.tsx
import { useMemo } from 'react';

import Image from 'next/image';

import { formatUnits } from 'viem';
import { useBalance } from 'wagmi';

import { SupplySteps } from '@ui/app/_components/SupplySteps';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSupplyVault } from '@ui/hooks/market/useSupplyVault';
import type { VaultRowData } from '@ui/hooks/market/useSupplyVaultsData';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';

import Amount from '../../../Amount';

interface SupplyTabProps {
  selectedVaultData: VaultRowData;
  chainId: number;
}

export function SupplyTab({ selectedVaultData, chainId }: SupplyTabProps) {
  const { address } = useMultiIonic();

  const balanceQueryParams = useMemo(
    () => ({
      address,
      token: selectedVaultData.underlyingToken as `0x${string}`,
      chainId
    }),
    [address, selectedVaultData.underlyingToken, chainId]
  );

  const { data: balanceData } = useBalance(balanceQueryParams);
  const walletBalance = balanceData?.value ?? 0n;

  const { data: maxSupplyAmount, isLoading: isLoadingMax } = useMaxSupplyAmount(
    selectedVaultData,
    selectedVaultData.vaultAddress as `0x${string}`,
    chainId
  );

  const maxAmount = useMemo(() => {
    if (!maxSupplyAmount?.bigNumber) return walletBalance;
    return walletBalance < maxSupplyAmount.bigNumber
      ? walletBalance
      : maxSupplyAmount.bigNumber;
  }, [walletBalance, maxSupplyAmount?.bigNumber]);

  const {
    amount,
    setAmount,
    utilizationPercentage,
    handleUtilization,
    approveAmount,
    supplyAmount,
    isApproving,
    isSupplying,
    isPolling,
    isWaitingForIndexing
  } = useSupplyVault({
    maxAmount,
    underlyingDecimals: selectedVaultData.underlyingDecimals,
    underlyingToken: selectedVaultData.underlyingToken as `0x${string}`,
    underlyingSymbol: selectedVaultData.underlyingSymbol as string,
    vaultAddress: selectedVaultData.vaultAddress as `0x${string}`,
    chainId
  });

  return (
    <div className="space-y-4">
      <Amount
        amount={amount}
        handleInput={(val?: string) => setAmount(val ?? '')}
        isLoading={isLoadingMax || isPolling}
        max={formatUnits(
          maxSupplyAmount?.bigNumber ?? 0n,
          selectedVaultData.underlyingDecimals
        )}
        symbol={selectedVaultData.underlyingSymbol}
        currentUtilizationPercentage={utilizationPercentage}
        handleUtilization={handleUtilization}
      />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>SUPPLY APR</span>
          <span>4.49%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Your supply</span>
          <span>$200 &rarr; $400</span>
        </div>
      </div>

      <Card className="bg-darkthree border-none">
        <CardHeader>
          <CardTitle className="text-lg">Strategy Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>SUPPLY ASSET</span>
            <div className="flex items-center gap-2">
              <Image
                src={`/img/symbols/32/color/${selectedVaultData.asset.toLowerCase()}.png`}
                alt={selectedVaultData.asset}
                width={20}
                height={20}
                className="w-5 h-5"
              />
              <span>{selectedVaultData.underlyingSymbol}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span>APR</span>
            <span>4.49%</span>
          </div>
          <div className="flex justify-between">
            <span>TOTAL SUPPLY</span>
            <span>$582,462.04</span>
          </div>
        </CardContent>
      </Card>

      <SupplySteps
        symbol={selectedVaultData.underlyingSymbol}
        isApproving={isApproving}
        isSupplying={isSupplying}
        isWaitingForIndexing={isWaitingForIndexing}
        onApprove={approveAmount}
        onSupply={supplyAmount}
        disabled={Number(amount) <= 0}
      />
    </div>
  );
}
