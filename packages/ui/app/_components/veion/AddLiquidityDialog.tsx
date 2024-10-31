import { useState } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { Portal } from '@radix-ui/react-portal';
import { useChainId } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';
import { useVeION } from '@ui/hooks/veion/useVeION';
import { getToken } from '@ui/utils/getStakingTokens';

import MaxDeposit from '../stake/MaxDeposit';

const Widget = dynamic(() => import('../stake/Widget'), {
  ssr: false
});

interface AddLiquidityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chain: number;
  selectedToken: 'eth' | 'mode' | 'weth';
}

export default function AddLiquidityDialog({
  isOpen,
  onOpenChange,
  chain,
  selectedToken
}: AddLiquidityDialogProps) {
  // eslint-disable-next-line no-console
  console.log('selectedToken', selectedToken);
  const chainId = useChainId();
  const [ionAmount, setIonAmount] = useState<string>('');
  const [wethAmount, setWethAmount] = useState<string>('');
  const [widgetPopup, setWidgetPopup] = useState<boolean>(false);
  const { addLiquidity } = useVeION(chainId);

  // Only allow dialog to close if widget is not open
  const handleOpenChange = (open: boolean) => {
    if (widgetPopup) return; // Prevent dialog from closing if widget is open
    onOpenChange(open);
  };

  const handleAddLiquidity = async () => {
    await addLiquidity({
      tokenAmount: '1.0',
      tokenBAmount: '0.5',
      selectedToken: 'eth'
    });
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="bg-[#1C1D1F] sm:max-w-[425px] p-6">
          {/* Buy ION Token Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-semibold">Get</span>
                <div className="w-8 h-8 relative">
                  <Image
                    src="/img/symbols/32/color/ion.png"
                    alt="ION"
                    className="rounded-full"
                    fill
                    sizes="(max-width: 32px) 100vw"
                    priority
                  />
                </div>
                <span className="text-2xl font-semibold">ION Token</span>
              </div>
            </div>

            <Button
              variant="default"
              className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold h-10"
              onClick={() => setWidgetPopup(true)}
            >
              Buy ION Token
            </Button>
          </div>

          <Separator className="my-6 bg-gray-800" />

          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Add ION Liquidity
              </DialogTitle>
            </DialogHeader>

            <MaxDeposit
              headerText="DEPOSIT"
              amount={ionAmount}
              tokenName="ION"
              token={getToken(chainId)}
              handleInput={(val?: string) => setIonAmount(val || '')}
              chain={chainId}
              max="100"
              size={24}
            />

            <MaxDeposit
              headerText="DEPOSIT"
              amount={wethAmount}
              tokenName="WETH"
              token={getToken(chainId)}
              handleInput={(val?: string) => setWethAmount(val || '')}
              chain={chainId}
              max="100"
              size={24}
            />

            <div>
              <p className="text-[11px] text-white/50 mb-2">EXPECTED LP</p>
              <div className="flex items-center justify-between">
                <p>0.0</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    <div className="w-6 h-6 relative">
                      <Image
                        src="/img/logo/ion.svg"
                        alt="ION"
                        className="rounded-full"
                        fill
                        sizes="(max-width: 24px) 100vw"
                      />
                    </div>
                    <div className="w-6 h-6 relative -ml-2">
                      <Image
                        src="/img/logo/eth.svg"
                        alt="WETH"
                        className="rounded-full"
                        fill
                        sizes="(max-width: 24px) 100vw"
                      />
                    </div>
                  </div>
                  <span>ION/WETH</span>
                </div>
              </div>
            </div>

            <Button
              variant="default"
              className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold h-10"
              onClick={handleAddLiquidity}
            >
              Provide Liquidity
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Portal>
        <Widget
          close={() => setWidgetPopup(false)}
          open={widgetPopup}
          chain={+chain}
        />
      </Portal>
    </>
  );
}
