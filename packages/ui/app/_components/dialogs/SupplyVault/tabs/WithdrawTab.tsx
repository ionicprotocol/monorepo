import { useState } from 'react';
import { formatUnits } from 'viem';
import { ThreeCircles } from 'react-loader-spinner';
import { Button } from '@ui/components/ui/button';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';
import { useWithdrawVault } from '@ui/hooks/market/useWithdrawVault';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import MaxDeposit from '../../../MaxDeposit';
import { VaultRowData } from '@ui/types/SupplyVaults';

interface WithdrawTabProps {
  selectedVaultData: VaultRowData;
  chainId: number;
}

export function WithdrawTab({ selectedVaultData, chainId }: WithdrawTabProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { isConnected } = useMultiIonic();

  const { data: maxAmount, isLoading: isLoadingMax } = useMaxWithdrawAmount(
    selectedVaultData as any,
    chainId
  );

  const { isWaitingForIndexing, withdrawAmount, isPolling, amount, setAmount } =
    useWithdrawVault({
      maxAmount: maxAmount ?? 0n,
      selectedVaultData,
      chainId
    });

  const handleWithdrawProcess = async () => {
    if (!isConnected) return;

    try {
      setIsProcessing(true);
      await withdrawAmount();
    } catch (error) {
      console.error('Withdraw error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <MaxDeposit
        amount={amount}
        handleInput={(val?: string) => setAmount(val ?? '')}
        isLoading={isLoadingMax || isPolling}
        max={formatUnits(maxAmount ?? 0n, selectedVaultData.underlyingDecimals)}
        tokenName={selectedVaultData.underlyingSymbol}
        decimals={selectedVaultData.underlyingDecimals}
        chain={chainId}
        headerText="Withdraw Amount"
        showUtilizationSlider
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
        className="w-full bg-accent hover:opacity-80"
        disabled={
          isProcessing ||
          !amount ||
          !isConnected ||
          Number(amount) <= 0 ||
          isWaitingForIndexing
        }
        onClick={handleWithdrawProcess}
      >
        {!isConnected ? (
          'Connect Wallet'
        ) : isProcessing ? (
          <>
            Processing
            <ThreeCircles
              ariaLabel="three-circles-loading"
              color="black"
              height={40}
              visible={true}
              width={40}
              wrapperStyle={{
                height: '40px',
                alignItems: 'center',
                width: '40px'
              }}
            />
          </>
        ) : isWaitingForIndexing ? (
          'Updating Balances...'
        ) : (
          `Withdraw ${selectedVaultData.underlyingSymbol}`
        )}
      </Button>
    </div>
  );
}
