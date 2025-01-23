import { useState, useCallback } from 'react';

import { Portal } from '@radix-ui/react-portal';
import { useAccount } from 'wagmi';

import MaxDeposit from '@ui/components/MaxDeposit';
import Widget from '@ui/components/stake/Widget';
import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';
import BuyIonSection from '@ui/components/veion/BuyIonSection';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useLiquidityCalculations } from '@ui/hooks/useLiquidityCalculations';

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
  const { currentChain } = useVeIONContext();
  const [maxDeposit, setMaxDeposit] = useState<{ ion: string; eth: string }>({
    ion: '',
    eth: ''
  });
  const [widgetPopup, setWidgetPopup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    calculateTokenAmount,
    getMaximumIonInput,
    wouldExceedLiquidity,
    ionBalance,
    selectedTokenBalance
  } = useLiquidityCalculations({
    address,
    chainId: currentChain,
    selectedToken
  });

  const updateDepositValues = useCallback(
    (ionValue: string) => {
      if (!ionValue) {
        setMaxDeposit({ ion: '', eth: '' });
        return;
      }

      const ethValue = calculateTokenAmount(ionValue);
      if (ethValue) {
        setMaxDeposit({ ion: ionValue, eth: ethValue });
      }
    },
    [calculateTokenAmount]
  );

  const handleIonInput = useCallback(
    (val?: string) => {
      if (!val) {
        updateDepositValues('');
        return;
      }

      if (wouldExceedLiquidity(val)) {
        const maxInput = getMaximumIonInput();
        updateDepositValues(maxInput);
        return;
      }

      updateDepositValues(val);
    },
    [wouldExceedLiquidity, getMaximumIonInput, updateDepositValues]
  );

  const handleAddLiquidity = async () => {
    try {
      if (!isConnected || !address) {
        console.warn('Wallet not connected');
        return;
      }

      setIsLoading(true);
      // Your existing addLiquidity logic here
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !widgetPopup && onOpenChange(open)}
      >
        <DialogContent className="bg-grayUnselect w-full max-w-[480px]">
          <BuyIonSection onBuy={() => setWidgetPopup(true)} />

          <Separator className="bg-white/10" />

          <div className="space-y-6">
            <DialogHeader className="flex flex-row items-center pr-0">
              <DialogTitle>Add ION Liquidity</DialogTitle>
            </DialogHeader>

            <MaxDeposit
              headerText="DEPOSIT ION"
              max={ionBalance}
              effectiveMax={getMaximumIonInput()}
              amount={maxDeposit.ion}
              tokenName="ion"
              handleInput={handleIonInput}
              chain={currentChain}
              showUtilizationSlider
            />

            <MaxDeposit
              headerText={`DEPOSIT ${selectedToken.toUpperCase()}`}
              max={selectedTokenBalance}
              amount={maxDeposit.eth}
              tokenName={selectedToken}
              chain={currentChain}
              showUtilizationSlider
              readonly={true}
            />

            <Button
              variant="default"
              className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold h-10"
              onClick={handleAddLiquidity}
              disabled={
                !isConnected || !maxDeposit.ion || !maxDeposit.eth || isLoading
              }
            >
              {isLoading ? 'Adding Liquidity...' : 'Provide Liquidity'}
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
