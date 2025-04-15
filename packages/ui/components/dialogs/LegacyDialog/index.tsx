import { useState } from 'react';

import Image from 'next/image';

import { formatUnits, parseUnits } from 'ethers';
import { ThreeCircles } from 'react-loader-spinner';
import { base } from 'viem/chains';
import { useChainId, useSwitchChain } from 'wagmi';

import MaxDeposit from '@ui/components/MaxDeposit';
import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { useMorphoProtocol } from '@ui/hooks/earn/useMorphoProtocol';

interface LegacyDialogProps {
  asset: string[];
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export function LegacyDialog({ asset, isOpen, setIsOpen }: LegacyDialogProps) {
  const assetSymbol = asset[0] as 'USDC' | 'WETH';
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { maxWithdraw, withdraw, isConnected } = useMorphoProtocol({
    asset: assetSymbol,
    isLegacy: true
  });

  const formattedMaxWithdraw = formatUnits(
    maxWithdraw,
    assetSymbol === 'WETH' ? 18 : 6
  );

  const handleInputChange = (value?: string) => {
    setAmount(value || '');
  };

  const handleWithdraw = async () => {
    if (!isConnected) return;

    try {
      if (chainId !== base.id) {
        try {
          await switchChain({ chainId: base.id });
          return;
        } catch (switchError) {
          console.error('Failed to switch network:', switchError);
          return;
        }
      }

      setIsProcessing(true);
      const parsedAmount = parseUnits(amount, assetSymbol === 'WETH' ? 18 : 6);
      await withdraw(parsedAmount);
      setAmount('');
    } catch (error) {
      console.error('Withdraw error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen?.(val);
      }}
    >
      <DialogContent
        maxWidth="500px"
        className="bg-grayUnselect p-4"
        fullWidth
      >
        <DialogHeader>
          <DialogTitle>
            <div className="flex w-20 mx-auto relative text-center">
              <Image
                alt="modlogo"
                className="mx-auto"
                height={32}
                src={`/img/symbols/32/color/${asset[0]?.toLowerCase()}.png`}
                width={32}
              />
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-1">
          <MaxDeposit
            amount={amount}
            max={formattedMaxWithdraw}
            tokenName={assetSymbol}
            handleInput={handleInputChange}
            chain={base.id}
            headerText="Withdraw Amount"
            useUnderlyingBalance
            showUtilizationSlider
            hintText="Max Withdraw"
          />
          <Button
            className="w-full bg-accent hover:opacity-80"
            onClick={handleWithdraw}
            disabled={isProcessing || !amount || !isConnected}
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
            ) : chainId !== base.id ? (
              'Switch to Base'
            ) : (
              'Withdraw'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
