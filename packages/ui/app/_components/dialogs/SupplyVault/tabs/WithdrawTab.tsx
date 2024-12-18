// tabs/WithdrawTab.tsx
import { useEffect, useMemo } from 'react';
import { formatUnits } from 'viem';
import { Button } from '@ui/components/ui/button';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';
import type { VaultRowData } from '@ui/hooks/market/useSupplyVaultsData';
import Amount from '../../../Amount';
import { useWithdrawVault } from '@ui/hooks/market/useWithdrawVault';

interface WithdrawTabProps {
  selectedVaultData: VaultRowData;
  chainId: number;
}

export function WithdrawTab({ selectedVaultData, chainId }: WithdrawTabProps) {
  const { data: maxAmount, isLoading: isLoadingMax } = useMaxWithdrawAmount(
    selectedVaultData as any,
    chainId
  );

  const {
    isWaitingForIndexing,
    withdrawAmount,
    isPolling,
    amount,
    setAmount,
    utilizationPercentage,
    handleUtilization,
    amountAsBInt
  } = useWithdrawVault({
    maxAmount: maxAmount ?? 0n,
    selectedVaultData,
    chainId
  });

  return (
    <div className="space-y-4">
      <Amount
        amount={amount}
        handleInput={(val?: string) => setAmount(val ?? '')}
        isLoading={isLoadingMax || isPolling}
        max={formatUnits(maxAmount ?? 0n, selectedVaultData.underlyingDecimals)}
        symbol={selectedVaultData.underlyingSymbol}
        currentUtilizationPercentage={utilizationPercentage}
        handleUtilization={handleUtilization}
      />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Withdraw Amount</span>
          <span>
            {amount} {selectedVaultData.underlyingSymbol}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Your vault balance</span>
          <span>$400 &rarr; $200</span>
        </div>
      </div>

      <Button
        className="w-full bg-accent hover:bg-accent/80"
        disabled={!amount || Number(amount) <= 0 || isWaitingForIndexing}
        onClick={withdrawAmount}
      >
        {isWaitingForIndexing
          ? 'Updating Balances...'
          : `Withdraw ${selectedVaultData.underlyingSymbol}`}
      </Button>
    </div>
  );
}
