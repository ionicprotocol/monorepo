import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@ui/components/ui/button';
import { DialogHeader, DialogTitle } from '@ui/components/ui/dialog';

interface SuccessViewProps {
  amount: number;
  onClose: () => void;
}

export function SuccessView({ amount, onClose }: SuccessViewProps) {
  const router = useRouter();

  const handleNavigateAndClose = () => {
    onClose();
    router.push('/veion/governance');
  };

  return (
    <div className="flex flex-col gap-y-4 py-2">
      <DialogHeader>
        <DialogTitle>Position Created Successfully!</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-white/60">
        Successfully created veION position by locking {amount.toFixed(2)} LP
        tokens.
        <br /> <br />
        Your veION position represents your locked tokens and voting power. Head
        to the veION Overview to start participating in market governance.
      </p>
      <Image
        src="/img/symbols/32/color/ion.png"
        alt="veion nft"
        width={48}
        height={48}
        className="w-12 mx-auto h-12"
      />
      <Button
        onClick={handleNavigateAndClose}
        className="w-full bg-accent text-black"
      >
        View My Positions
      </Button>
    </div>
  );
}
