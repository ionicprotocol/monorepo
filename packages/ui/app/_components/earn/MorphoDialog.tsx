import { useCallback, useEffect, useState } from 'react';

import { utils } from 'ethers';
import { base } from 'viem/chains';
import { useChainId, useSwitchChain } from 'wagmi';
import { chainIdToConfig } from '@ionicprotocol/chains';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@ui/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@ui/components/ui/tabs';
import { useMorphoProtocol } from '@ui/hooks/earn/useMorphoProtocol';

import MaxDeposit from '../MaxDeposit';
import { morphoBaseAddresses } from '@ui/utils/morphoUtils';

interface MorphoDialogProps {
  asset: string[];
}

export function MorphoDialog({ asset }: MorphoDialogProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { supply, withdraw, getMaxWithdraw, isLoading, isConnected } =
    useMorphoProtocol();
  const [maxWithdraw, setMaxWithdraw] = useState<bigint>(BigInt(0));
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const assetSymbol = asset[0] as 'USDC' | 'WETH';

  const fetchMaxWithdraw = useCallback(async () => {
    if (isConnected && !isLoading) {
      const max = await getMaxWithdraw(assetSymbol);
      setMaxWithdraw(max);
    }
  }, [isConnected, isLoading, assetSymbol, getMaxWithdraw]);

  useEffect(() => {
    fetchMaxWithdraw();
  }, [fetchMaxWithdraw]);

  const formattedMaxWithdraw = utils.formatUnits(
    maxWithdraw,
    assetSymbol === 'WETH' ? 18 : 6
  );

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

      await fetchMaxWithdraw();
    } catch (error) {
      console.error('Supply error:', error);
    } finally {
      setIsProcessing(false);
    }
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

      await fetchMaxWithdraw();
    } catch (error) {
      console.error('Withdraw error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Manage</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage {asset.join('/')} Vault</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="supply">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="supply">Supply</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          <TabsContent value="supply">
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
                    className="w-full"
                    onClick={handleSupply}
                    disabled={isProcessing || !amount || !isConnected}
                  >
                    {!isConnected
                      ? 'Connect Wallet'
                      : isProcessing
                        ? 'Processing...'
                        : chainId !== base.id
                          ? 'Switch to Base'
                          : 'Supply'}
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="withdraw">
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
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={isProcessing || !amount || !isConnected}
                  >
                    {!isConnected
                      ? 'Connect Wallet'
                      : isProcessing
                        ? 'Processing...'
                        : chainId !== base.id
                          ? 'Switch to Base'
                          : 'Withdraw'}
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
