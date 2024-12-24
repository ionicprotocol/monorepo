import { useState } from 'react';
import { utils } from 'ethers';
import { base } from 'viem/chains';
import { useChainId, useSwitchChain } from 'wagmi';
import { Button } from '@ui/components/ui/button';
import { ThreeCircles } from 'react-loader-spinner';
import { morphoBaseAddresses } from '@ui/utils/morphoUtils';
import MaxDeposit from '@ui/app/components/MaxDeposit';
import { useMorphoProtocol } from '@ui/hooks/earn/useMorphoProtocol';

interface SupplyTabProps {
  assetSymbol: 'USDC' | 'WETH';
  onSuccess: () => Promise<void>;
}

export function SupplyTab({ assetSymbol, onSuccess }: SupplyTabProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { supply, isLoading, isConnected } = useMorphoProtocol();

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
      const parsedAmount = utils.parseUnits(
        amount,
        assetSymbol === 'WETH' ? 18 : 6
      );
      await supply(assetSymbol, parsedAmount);
      setAmount('');
      await onSuccess();
    } catch (error) {
      console.error('Supply error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <MaxDeposit
            amount={amount}
            tokenName={assetSymbol}
            token={morphoBaseAddresses.tokens[assetSymbol]}
            handleInput={handleInputChange}
            chain={base.id}
            headerText="Supply Amount"
            decimals={assetSymbol === 'WETH' ? 18 : 6}
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
        </>
      )}
    </div>
  );
}
