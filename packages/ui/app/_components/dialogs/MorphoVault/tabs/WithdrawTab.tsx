import { useState } from 'react';
import { utils } from 'ethers';
import { base } from 'viem/chains';
import { useChainId, useSwitchChain } from 'wagmi';
import { Button } from '@ui/components/ui/button';
import { ThreeCircles } from 'react-loader-spinner';
import { morphoBaseAddresses } from '@ui/utils/morphoUtils';
import MaxDeposit from '@ui/app/_components/MaxDeposit';
import { useMorphoProtocol } from '@ui/hooks/earn/useMorphoProtocol';

interface WithdrawTabProps {
  assetSymbol: 'USDC' | 'WETH';
  onSuccess: () => Promise<void>;
  maxWithdraw: bigint;
}

export function WithdrawTab({
  assetSymbol,
  maxWithdraw,
  onSuccess
}: WithdrawTabProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { withdraw, isLoading, isConnected } = useMorphoProtocol();

  const formattedMaxWithdraw = utils.formatUnits(
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
      const parsedAmount = utils.parseUnits(
        amount,
        assetSymbol === 'WETH' ? 18 : 6
      );
      await withdraw(assetSymbol, parsedAmount);
      setAmount('');
      await onSuccess();
    } catch (error) {
      console.error('Withdraw error:', error);
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
            max={formattedMaxWithdraw}
            tokenName={assetSymbol}
            token={morphoBaseAddresses.tokens[assetSymbol]}
            handleInput={handleInputChange}
            chain={base.id}
            headerText="Withdraw Amount"
            useUnderlyingBalance
            decimals={assetSymbol === 'WETH' ? 18 : 6}
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
        </>
      )}
    </div>
  );
}
