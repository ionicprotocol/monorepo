import { useState, useCallback } from 'react';

import { Portal } from '@radix-ui/react-portal';
import { useAccount } from 'wagmi';

import MaxDeposit from '@ui/components/MaxDeposit';
import Widget from '@ui/components/stake/Widget';
import TransactionButton from '@ui/components/TransactionButton';
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
import { useVeIONActions } from '@ui/hooks/veion/useVeIONActions';

interface AddLiquidityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedToken: 'eth' | 'mode' | 'weth';
}

// AddLiquidityDialog.tsx
export default function AddLiquidityDialog({
  isOpen,
  onOpenChange,
  selectedToken
}: AddLiquidityDialogProps) {
  const { address, isConnected, chainId } = useAccount();
  const { currentChain } = useVeIONContext();
  const [maxDeposit, setMaxDeposit] = useState<{ ion: string; eth: string }>({
    ion: '',
    eth: ''
  });
  const [widgetPopup, setWidgetPopup] = useState<boolean>(false);
  const { addLiquidity, isPending } = useVeIONActions();

  const {
    calculateTokenAmount,
    getMaximumIonInput,
    wouldExceedLiquidity,
    ionBalance,
    selectedTokenBalance,
    refetchAll
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
        return {
          success: false
        };
      }

      await addLiquidity({
        tokenAmount: maxDeposit.ion,
        tokenBAmount: maxDeposit.eth,
        selectedToken
      });

      // Refresh data after transaction
      await refetchAll();

      setMaxDeposit({ ion: '', eth: '' });

      return { success: true };
    } catch (err) {
      console.warn(err);
      return { success: false };
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          !widgetPopup && onOpenChange(open);
          setMaxDeposit({ ion: '', eth: '' });
        }}
      >
        <DialogContent className="bg-black bg-opacity-90 border border-white/10 shadow-2xl backdrop-blur-lg w-full max-w-[520px] p-6">
          <BuyIonSection onBuy={() => setWidgetPopup(true)} />

          <Separator className="bg-white/5 my-6" />

          <div className="space-y-8">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
                Add ION Liquidity
              </DialogTitle>
              <p className="text-sm text-white/60">
                Provide liquidity to earn fees and participate in governance
              </p>
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

            <TransactionButton
              onSubmit={handleAddLiquidity}
              isDisabled={
                !isConnected ||
                !maxDeposit.ion ||
                !maxDeposit.eth ||
                maxDeposit.ion === '0' ||
                maxDeposit.eth === '0'
              }
              buttonText="Provide Liquidity"
              targetChainId={currentChain}
              onContinue={() => {
                setMaxDeposit({ ion: '', eth: '' });
                onOpenChange(false);
              }}
            />
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
