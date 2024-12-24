import Image from 'next/image';

import { base, optimism, mode } from 'viem/chains';

import { Button } from '@ui/components/ui/button';
import { DialogHeader, DialogTitle } from '@ui/components/ui/dialog';

import NetworkDropdown from '../NetworkDropdown';

interface BuyIonSectionProps {
  onBuy: () => void;
  currentChain: number;
}

function BuyIonSection({ onBuy, currentChain }: BuyIonSectionProps) {
  return (
    <div className="space-y-4">
      <DialogHeader className="flex flex-row items-center">
        <div className="flex items-center justify-between w-full">
          <DialogTitle>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-semibold">Get</span>
              <div className="w-8 h-8 relative">
                <Image
                  src="/img/logo/ion.svg"
                  alt="ION"
                  className="rounded-full"
                  fill
                  sizes="(max-width: 32px) 100vw"
                  priority
                />
              </div>
              <span className="text-2xl font-medium">ION Token</span>
            </div>
          </DialogTitle>
          <NetworkDropdown
            dropdownSelectedChain={currentChain}
            nopool
            enabledChains={[mode.id, base.id, optimism.id]}
          />
        </div>
      </DialogHeader>

      <Button
        variant="default"
        className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold h-10"
        onClick={onBuy}
      >
        Buy ION Token
      </Button>
    </div>
  );
}

export default BuyIonSection;
