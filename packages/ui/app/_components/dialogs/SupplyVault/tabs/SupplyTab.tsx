import { useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { useBalance } from 'wagmi';
import { ThreeCircles } from 'react-loader-spinner';
import { Button } from '@ui/components/ui/button';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSupplyVault } from '@ui/hooks/market/useSupplyVault';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import MaxDeposit from '@ui/app/_components/MaxDeposit';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const { address, isConnected } = useMultiIonic();

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

  const handleSupplyProcess = async () => {
    if (!isConnected) return;

    try {
      setIsProcessing(true);
      await approveAmount();
      await supplyAmount();
    } catch (error) {
      console.error('Supply error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const tokenAddress =
    supplyVaultAddresses[chainId as SupportedSupplyVaultChainId]?.tokens[
      selectedVaultData.underlyingSymbol as 'WETH' | 'USDC'
    ];

  return (
    <div className="space-y-4">
      <MaxDeposit
        amount={amount}
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
        disabled={
          isProcessing || !amount || !isConnected || Number(amount) <= 0
        }
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
          `Supply ${selectedVaultData.underlyingSymbol}`
        )}
      </Button>
    </div>
  );
}
