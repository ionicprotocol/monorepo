import { useState } from 'react';

import Image from 'next/image';

import { useChainId } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { getToken } from '@ui/utils/getStakingTokens';

import MaxDeposit from '../stake/MaxDeposit';

interface AddLiquidityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddLiquidityDialog({
  isOpen,
  onOpenChange
}: AddLiquidityDialogProps) {
  const chainId = useChainId();
  const [ionAmount, setIonAmount] = useState<string>('');
  const [wethAmount, setWethAmount] = useState<string>('');

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-grayone sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add ION Liquidity
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ION Input */}
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

          {/* WETH Input */}
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

          {/* Expected LP */}
          <div>
            <p className="text-xs text-white/50">EXPECTED LP</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-medium">0.0</p>
              <div className="flex items-center gap-2">
                <div className="flex">
                  <Image
                    src="/img/logo/ion.svg"
                    alt="ION"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <Image
                    src="/img/logo/eth.svg"
                    alt="WETH"
                    width={24}
                    height={24}
                    className="rounded-full -ml-2"
                  />
                </div>
                <span className="text-sm">ION/WETH</span>
              </div>
            </div>
          </div>

          <Button className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold py-6">
            Provide Liquidity
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
