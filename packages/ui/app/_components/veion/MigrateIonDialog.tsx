import { useState, useEffect } from 'react';

import { base, optimism, mode } from 'viem/chains';
import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { useVeION } from '@ui/context/VeIonContext';
import { useVeIONActions } from '@ui/hooks/veion/useVeIONActions';

import NetworkDropdown from '../NetworkDropdown';
import MaxDeposit from '../stake/MaxDeposit';

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

  const { currentChain, veIonBalance } = useVeION();
  const { removeLiquidity, isPending } = useVeIONActions();

  // const stakingTokenBalance = getTokenBalance('eth');

  useEffect(() => {
    setAmount('0');
  }, [currentChain]);

  const handleWithdraw = async () => {
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
      <DialogContent className="bg-grayUnselect max-w-[580px]">
        <DialogHeader className="flex flex-row items-center">
          <DialogTitle className="flex items-center gap-4">
            <p>Migrate ION Liquidity</p>
            <NetworkDropdown
              dropdownSelectedChain={currentChain}
              nopool
              enabledChains={[mode.id, base.id, optimism.id]}
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <MaxDeposit
            amount={amount}
            handleInput={(val?: string) => setAmount(val || '0')}
            tokenName="ion"
            pairedToken="weth"
            chain={currentChain}
            max={veIonBalance}
            headerText="Available LP"
            useSlider
          />

          <Button
            onClick={handleWithdraw}
            className="w-full bg-red-500 text-white hover:bg-red-600"
            disabled={!amount || Number(amount) === 0 || isLoading || isPending}
          >
            {isLoading || isPending ? 'Withdrawing...' : 'Withdraw Liquidity'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
