import { useState, useEffect } from 'react';

import dynamic from 'next/dynamic';

import { Portal } from '@radix-ui/react-portal';
import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';
import { useVeION } from '@ui/context/VeIonContext';
import { useVeIONActions } from '@ui/hooks/veion/useVeIONActions';

import BuyIonSection from './BuyIonSection';
import MaxDeposit from '../stake/MaxDeposit';

const Widget = dynamic(() => import('../stake/Widget'), {
  ssr: false
});

interface AddLiquidityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedToken: 'eth' | 'mode' | 'weth';
}

export default function AddLiquidityDialog({
  isOpen,
  onOpenChange,
  selectedToken
}: AddLiquidityDialogProps) {
  const { address, isConnected } = useAccount();
  const [maxDeposit, setMaxDeposit] = useState<{ ion: string; eth: string }>({
    ion: '',
    eth: ''
  });
  const [widgetPopup, setWidgetPopup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const { currentChain, ionBalance, getTokenBalance, calculateTokenAmount } =
    useVeION();
  const { addLiquidity, isPending } = useVeIONActions();
  const selectedTokenBalance = getTokenBalance(selectedToken);

  // Update paired token amount whenever ION amount changes
  useEffect(() => {
    if (maxDeposit.ion) {
      const tokenAmount = calculateTokenAmount(maxDeposit.ion, selectedToken);
      setMaxDeposit((prev) => ({ ...prev, eth: tokenAmount }));
    } else {
      setMaxDeposit((prev) => ({ ...prev, eth: '' }));
    }
  }, [maxDeposit.ion, selectedToken, calculateTokenAmount]);

  const handleAddLiquidity = async () => {
    try {
      if (!isConnected || !address) {
        console.warn('Wallet not connected');
        return;
      }

      setIsLoading(true);

      await addLiquidity({
        tokenAmount: maxDeposit.ion,
        tokenBAmount: maxDeposit.eth,
        selectedToken
      });

      setMaxDeposit({ ion: '', eth: '' });
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Only allow updating ION amount directly
  const handleIonInput = (val?: string) => {
    setMaxDeposit((prev) => ({ ...prev, ion: val || '' }));
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !widgetPopup && onOpenChange(open)}
      >
        <DialogContent className="bg-[#1C1D1F] sm:max-w-[425px] p-6">
          <BuyIonSection onBuy={() => setWidgetPopup(true)} />

          <Separator className="my-6 bg-gray-800" />

          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Add ION Liquidity
              </DialogTitle>
            </DialogHeader>

            <MaxDeposit
              headerText="DEPOSIT ION"
              max={ionBalance}
              amount={maxDeposit.ion}
              tokenName="ion"
              pairedToken={selectedToken}
              handleInput={handleIonInput}
              chain={currentChain}
              useSlider
              size={16}
            />

            <MaxDeposit
              headerText={`DEPOSIT ${selectedToken.toUpperCase()}`}
              max={selectedTokenBalance}
              amount={maxDeposit.eth}
              tokenName={selectedToken}
              pairedToken="ion"
              chain={currentChain}
              useSlider
              size={16}
            />

            <Button
              variant="default"
              className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold h-10"
              onClick={handleAddLiquidity}
              disabled={
                !isConnected ||
                !maxDeposit.ion ||
                !maxDeposit.eth ||
                isLoading ||
                isPending
              }
            >
              {isLoading || isPending
                ? 'Adding Liquidity...'
                : 'Provide Liquidity'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Portal>
        <Widget
          close={() => setWidgetPopup(false)}
          open={widgetPopup}
          chain={currentChain}
        />
      </Portal>
    </>
  );
}
