import { ThreeCircles } from 'react-loader-spinner';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';

import MaxDeposit from '@ui/components/MaxDeposit';
import { Button } from '@ui/components/ui/button';
import { useWithdrawVault } from '@ui/hooks/market/useWithdrawVault';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';
import type { VaultRowData } from '@ui/types/SupplyVaults';

interface WithdrawTabProps {
  selectedVaultData: VaultRowData;
  chainId: number;
}

export function WithdrawTab({ selectedVaultData, chainId }: WithdrawTabProps) {
  const { isConnected } = useAccount();

  const { data: maxAmount, isLoading: isLoadingMax } = useMaxWithdrawAmount(
    selectedVaultData as any,
    chainId
  );

  const { withdrawAmount, amount, setAmount, isWithdrawing, isPending } =
    useWithdrawVault({
      maxAmount: maxAmount ?? 0n,
      selectedVaultData
    });

  const handleWithdrawProcess = async () => {
    if (!isConnected) return;
    await withdrawAmount();
  };

  const isProcessing = isWithdrawing || isPending;

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (isProcessing) return 'Withdrawing...';
    return `Withdraw ${selectedVaultData.underlyingSymbol}`;
  };

  return (
    <div className="space-y-4">
      <MaxDeposit
        amount={amount}
        handleInput={(val?: string) => setAmount(val ?? '')}
        isLoading={isLoadingMax}
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
          isProcessing || !amount || !isConnected || Number(amount) <= 0
        }
        onClick={handleWithdrawProcess}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            {getButtonText()}
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
          </div>
        ) : (
          getButtonText()
        )}
      </Button>
    </div>
  );
}
