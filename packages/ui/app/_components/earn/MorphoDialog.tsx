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
import ActionButton from '../ActionButton';
import Image from 'next/image';
import { ThreeCircles } from 'react-loader-spinner';

interface MorphoDialogProps {
  asset: string[];
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export function MorphoDialog({ asset, isOpen, setIsOpen }: MorphoDialogProps) {
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

  const resetValues = () => {
    setAmount('');
    setIsProcessing(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen?.(val);
        resetValues();
      }}
    >
      <DialogContent
        maxWidth="500px"
        className="bg-grayUnselect"
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
        <Tabs
          defaultValue="supply"
          onValueChange={resetValues}
        >
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
                            height: `${40}px`,
                            alignItems: 'center',
                            width: `${40}px`
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
                            height: `${40}px`,
                            alignItems: 'center',
                            width: `${40}px`
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
