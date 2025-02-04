import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@ui/components/ui/button';
import { DialogHeader, DialogTitle } from '@ui/components/ui/dialog';
import { useVeIONContext } from '@ui/context/VeIonContext';

interface SuccessViewProps {
  amount: number;
  onClose: () => void;
  chain: number;
}

export function SuccessView({ amount, onClose, chain }: SuccessViewProps) {
  const router = useRouter();
  const { locks } = useVeIONContext();

  const handleNavigateAndClose = async () => {
    onClose();
    if (locks.refetch) {
      await locks.refetch();
    }
    router.push(`/veion/governance?chain=${chain}`);
  };

  return (
    <div className="flex flex-col gap-y-6 py-2">
      <DialogHeader className="space-y-3">
        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
          Position Created Successfully!
        </DialogTitle>
        <p className="text-sm text-white/60">
          Successfully created veION position by locking {amount.toFixed(2)} LP
          tokens. Your veION position represents your locked tokens and voting
          power.
        </p>
      </DialogHeader>

      <div className="relative w-24 h-24 mx-auto">
        <Image
          src="/img/symbols/32/color/ion.png"
          alt="veion nft"
          fill
          className="object-contain animate-pulse"
        />
      </div>

      <Button
        onClick={handleNavigateAndClose}
        className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-lg font-semibold py-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      >
        View My Positions
      </Button>
    </div>
  );
}
