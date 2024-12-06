// components/dialogs/SupplyVaultDialog.tsx
import { useEffect, useMemo } from 'react';

import Image from 'next/image';

import { ArrowLeft } from 'lucide-react';
import { formatUnits } from 'viem';
import { useBalance } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@ui/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Input } from '@ui/components/ui/input';
import { Slider } from '@ui/components/ui/slider';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSupplyVault } from '@ui/hooks/market/useSupplyVault';
import type { VaultRowData } from '@ui/hooks/market/useSupplyVaults';

interface SupplyVaultDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedVaultData: VaultRowData;
  chainId: number;
}

export default function SupplyVaultDialog({
  isOpen,
  setIsOpen,
  selectedVaultData,
  chainId
}: SupplyVaultDialogProps) {
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

  const maxAmount = balanceData?.value ?? 0n;

  const supplyVaultProps = useMemo(
    () => ({
      maxAmount,
      underlyingDecimals: selectedVaultData.underlyingDecimals,
      underlyingToken: selectedVaultData.underlyingToken as `0x${string}`,
      underlyingSymbol: selectedVaultData.underlyingSymbol as string,
      vaultAddress: selectedVaultData.vaultAddress as `0x${string}`,
      chainId
    }),
    [
      maxAmount,
      selectedVaultData.underlyingDecimals,
      selectedVaultData.underlyingToken,
      selectedVaultData.underlyingSymbol,
      selectedVaultData.vaultAddress,
      chainId
    ]
  );

  const {
    amount,
    setAmount,
    utilizationPercentage,
    handleUtilization,
    approveAmount,
    supplyAmount,
    isApproving,
    isSupplying
  } = useSupplyVault(supplyVaultProps);

  const formattedMaxAmount = useMemo(
    () => (balanceData ? formatUnits(maxAmount, balanceData.decimals) : '0'),
    [balanceData, maxAmount]
  );

  const handleAmountChange = (value: string) => {
    if (value === '') {
      setAmount('0');
      return;
    }
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    const parts = sanitizedValue.split('.');
    const finalValue = parts[0] + (parts[1] ? '.' + parts[1] : '');

    if (Number(finalValue) > Number(formattedMaxAmount)) {
      setAmount(formattedMaxAmount);
    } else {
      setAmount(finalValue);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setAmount('0');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogContent className="sm:max-w-[425px] bg-grayUnselect text-white">
        <DialogHeader>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <DialogTitle className="text-center">
            Supply {selectedVaultData.asset}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-400">
              <span>AMOUNT</span>
              <div className="flex items-center gap-2">
                <span>Wallet Balance: {formattedMaxAmount}</span>
                <Button
                  variant="link"
                  className="h-auto p-0 text-accent"
                  onClick={() => setAmount(formattedMaxAmount)}
                >
                  MAX
                </Button>
              </div>
            </div>

            <div className="relative">
              <Input
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="bg-darkthree pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {selectedVaultData.underlyingSymbol}
              </div>
            </div>

            <Slider
              value={[utilizationPercentage]}
              onValueChange={(values) => handleUtilization(values[0])}
              max={100}
              step={1}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>SUPPLY APR</span>
              <span>4.49%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GAS FEE</span>
              <span>$8.76</span>
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
                    src={`/icons/tokens/${selectedVaultData.asset.toLowerCase()}.svg`}
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
              disabled={isSupplying || Number(amount) <= 0}
              className="w-full bg-accent hover:bg-accent/90 text-black"
            >
              {isSupplying
                ? 'Supplying...'
                : `Supply ${selectedVaultData.underlyingSymbol}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
