// components/MorphoDialog.tsx
import { useState } from 'react';

import { utils } from 'ethers';

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

interface MorphoDialogProps {
  asset: string[];
}

export function MorphoDialog({ asset }: MorphoDialogProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { supply, withdraw, isLoading, isConnected } = useMorphoProtocol();

  const assetSymbol = asset[0] as 'USDC' | 'WETH';

  // Token addresses for Base network
  const tokenAddresses: { [key: string]: `0x${string}` } = {
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  };

  const handleInputChange = (value?: string) => {
    setAmount(value || '');
  };

  const handleSupply = async () => {
    if (!isConnected) return;

    try {
      setIsProcessing(true);
      const parsedAmount = utils.parseUnits(
        amount,
        assetSymbol === 'WETH' ? 18 : 6
      );
      await supply(assetSymbol, parsedAmount);
      setAmount('');
    } catch (error) {
      console.error('Supply error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected) return;

    try {
      setIsProcessing(true);
      const parsedAmount = utils.parseUnits(
        amount,
        assetSymbol === 'WETH' ? 18 : 6
      );
      await withdraw(assetSymbol, parsedAmount);
      setAmount('');
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
                    token={tokenAddresses[assetSymbol]}
                    handleInput={handleInputChange}
                    chain={8453} // Base chain ID
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
                    tokenName={assetSymbol}
                    token={tokenAddresses[assetSymbol]}
                    handleInput={handleInputChange}
                    chain={8453}
                    headerText="Withdraw Amount"
                    useUnderlyingBalance={true}
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
