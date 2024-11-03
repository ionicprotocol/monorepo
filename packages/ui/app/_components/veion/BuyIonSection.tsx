import Image from 'next/image';

import { Button } from '@ui/components/ui/button';

interface BuyIonSectionProps {
  onBuy: () => void;
}

function BuyIonSection({ onBuy }: BuyIonSectionProps) {
  return (
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
        onClick={onBuy}
      >
        Buy ION Token
      </Button>
    </div>
  );
}

export default BuyIonSection;
