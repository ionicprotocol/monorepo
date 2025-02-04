import Image from 'next/image';

import { WalletIcon } from 'lucide-react';

import { Button } from '@ui/components/ui/button';
import { DialogHeader, DialogTitle } from '@ui/components/ui/dialog';

interface BuyIonSectionProps {
  onBuy: () => void;
}

function BuyIonSection({ onBuy }: BuyIonSectionProps) {
  return (
    <div className="space-y-6 bg-white/5 rounded-xl border border-white/10 p-4">
      <DialogHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <Image
              src="/img/logo/ion.svg"
              alt="ION"
              className="rounded-full transform transition-all duration-500 hover:scale-110"
              fill
              sizes="(max-width: 48px) 100vw"
              priority
            />
          </div>
          <DialogTitle className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
              Get ION Token
            </span>
            <span className="text-sm font-normal text-white/60">
              Purchase ION tokens to provide liquidity
            </span>
          </DialogTitle>
        </div>
      </DialogHeader>

      <Button
        variant="default"
        className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-black font-semibold py-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2"
        onClick={onBuy}
      >
        <WalletIcon className="size-5" />
        Buy ION Token
      </Button>
    </div>
  );
}

export default BuyIonSection;
