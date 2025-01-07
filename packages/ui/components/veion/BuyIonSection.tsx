import Image from 'next/image';

import { Button } from '@ui/components/ui/button';
import { DialogHeader, DialogTitle } from '@ui/components/ui/dialog';

interface BuyIonSectionProps {
  onBuy: () => void;
}

function BuyIonSection({ onBuy }: BuyIonSectionProps) {
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
