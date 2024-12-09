// tabs/SupplyTab.tsx
import { useEffect, useMemo } from 'react';
import { formatUnits } from 'viem';
import { useBalance } from 'wagmi';
import { Button } from '@ui/components/ui/button';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSupplyVault } from '@ui/hooks/market/useSupplyVault';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import type { VaultRowData } from '@ui/hooks/market/useSupplyVaults';
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

      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={approveAmount}
          disabled={isApproving || Number(amount) <= 0}
          className="w-full bg-accent hover:bg-accent/90 text-black"
        >
          {isApproving
            ? 'Approving...'
            : `Approve ${selectedVaultData.underlyingSymbol}`}
        </Button>
        <Button
          onClick={supplyAmount}
          disabled={isSupplying || Number(amount) <= 0 || isWaitingForIndexing}
          className="w-full bg-accent hover:bg-accent/90 text-black"
        >
          {isWaitingForIndexing
            ? 'Updating Balances...'
            : isSupplying
              ? 'Supplying...'
              : `Supply ${selectedVaultData.underlyingSymbol}`}
        </Button>
      </div>
    </div>
  );
}
