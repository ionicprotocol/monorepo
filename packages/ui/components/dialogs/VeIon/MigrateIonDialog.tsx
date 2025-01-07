import { useState, useEffect } from 'react';

import { useAccount } from 'wagmi';

import MaxDeposit from '@ui/components/MaxDeposit';
import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONActions } from '@ui/hooks/veion/useVeIONActions';

interface MigrateIonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MigrateIonDialog({
  isOpen,
  onOpenChange
}: MigrateIonDialogProps) {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  const { currentChain, veIonBalance } = useVeIONContext();
  const { removeLiquidity, isPending } = useVeIONActions();

  // const stakingTokenBalance = getTokenBalance('eth');

  useEffect(() => {
    setAmount('0');
  }, [currentChain]);

  const handleMigrate = async () => {
    try {
      if (!isConnected) {
        console.warn('Wallet not connected');
        return;
      }

      setIsLoading(true);
      await removeLiquidity({
        liquidity: amount,
        selectedToken: 'eth'
      });
      setAmount('0');
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-grayUnselect w-full max-w-[480px]">
        <DialogHeader className="flex flex-row items-center">
          <DialogTitle>Migrate ION Liquidity</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <MaxDeposit
            amount={amount}
            handleInput={(val?: string) => setAmount(val || '0')}
            tokenName="ion/weth"
            chain={currentChain}
            max={veIonBalance}
            headerText="Available LP"
            showUtilizationSlider
          />

          <Button
            onClick={handleMigrate}
            className="w-full bg-red-500 text-white hover:bg-red-600"
            disabled={!amount || Number(amount) === 0 || isLoading || isPending}
          >
            {isLoading || isPending ? 'Migrating...' : 'Migrate Liquidity'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
