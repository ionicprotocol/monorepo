import { useState } from 'react';

import { parseUnits } from 'ethers';
import { ThreeCircles } from 'react-loader-spinner';
import { base } from 'viem/chains';
import { useChainId, useSwitchChain } from 'wagmi';

import MaxDeposit from '@ui/components/MaxDeposit';
import { Button } from '@ui/components/ui/button';
import { useMorphoProtocol } from '@ui/hooks/earn/useMorphoProtocol';
import { morphoBaseAddresses } from '@ui/utils/morphoUtils';

interface SupplyTabProps {
  assetSymbol: 'USDC' | 'WETH';
}

export function SupplyTab({ assetSymbol }: SupplyTabProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { supply, isConnected } = useMorphoProtocol({ asset: assetSymbol });

  const handleInputChange = (value?: string) => {
    setAmount(value || '');
  };

  const handleSupply = async () => {
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

      const decimals = assetSymbol === 'WETH' ? 18 : 6;
      const roundedAmount = Number(amount).toFixed(decimals);
      const parsedAmount = parseUnits(roundedAmount, decimals);

      await supply(parsedAmount);
      setAmount('');
    } catch (error) {
      console.error('Supply error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <MaxDeposit
        amount={amount}
        tokenName={assetSymbol}
        token={morphoBaseAddresses.tokens[assetSymbol]}
        handleInput={handleInputChange}
        chain={base.id}
        headerText="Supply Amount"
        hintText="Balance"
        decimals={assetSymbol === 'WETH' ? 18 : 6}
        showUtilizationSlider
      />
      <Button
        className="w-full bg-accent hover:opacity-80"
        onClick={handleSupply}
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
          'Supply'
        )}
      </Button>
    </div>
  );
}
