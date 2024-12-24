import { useMemo } from 'react';
import { ThreeCircles } from 'react-loader-spinner';
import { Button } from '@ui/components/ui/button';
import { useAccount } from 'wagmi';
import { useSupplyVault } from '@ui/hooks/market/useSupplyVault';
import MaxDeposit from '@ui/app/components/MaxDeposit';
import { VaultRowData } from '@ui/types/SupplyVaults';
import {
  supplyVaultAddresses,
  SupportedSupplyVaultChainId
} from '@ui/utils/marketUtils';

interface SupplyTabProps {
  selectedVaultData: VaultRowData;
  chainId: number;
}

export function SupplyTab({ selectedVaultData, chainId }: SupplyTabProps) {
  const { isConnected } = useAccount();

  const {
    amount,
    setAmount,
    approveAmount,
    supplyAmount,
    isApproving,
    isSupplying,
    isPending,
    needsApproval
  } = useSupplyVault({
    underlyingDecimals: selectedVaultData.underlyingDecimals,
    underlyingToken: selectedVaultData.underlyingToken as `0x${string}`,
    underlyingSymbol: selectedVaultData.underlyingSymbol as string
  });

  const tokenAddress = useMemo(
    () =>
      supplyVaultAddresses[chainId as SupportedSupplyVaultChainId]?.tokens[
        selectedVaultData.underlyingSymbol as 'WETH' | 'USDC'
      ],
    [chainId, selectedVaultData.underlyingSymbol]
  );

  const handleSupplyProcess = async () => {
    if (!isConnected) return;

    if (needsApproval) {
      await approveAmount();
    } else {
      await supplyAmount();
    }
  };

  const isProcessing = isApproving || isSupplying || isPending;
  const buttonDisabled =
    isProcessing || !amount || !isConnected || Number(amount) <= 0;

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (isProcessing) return needsApproval ? 'Approving...' : 'Supplying...';
    if (needsApproval) return `Approve ${selectedVaultData.underlyingSymbol}`;
    return `Supply ${selectedVaultData.underlyingSymbol}`;
  };

  return (
    <div className="space-y-4">
      <MaxDeposit
        amount={amount}
        isLoading={isProcessing}
        tokenName={selectedVaultData.underlyingSymbol}
        token={tokenAddress as `0x${string}`}
        handleInput={(val?: string) => setAmount(val ?? '')}
        chain={chainId}
        headerText="Supply Amount"
        decimals={selectedVaultData.underlyingDecimals}
        showUtilizationSlider
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

      <Button
        className="w-full bg-accent hover:opacity-80"
        onClick={handleSupplyProcess}
        disabled={buttonDisabled}
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
