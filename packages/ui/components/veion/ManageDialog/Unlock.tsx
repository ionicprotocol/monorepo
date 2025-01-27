import { InfoIcon } from 'lucide-react';
import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';

type UnlockProps = {
  chain: string;
};

export function Unlock({ chain }: UnlockProps) {
  const { selectedManagePosition } = useVeIONContext();
  const { address } = useAccount();
  const { unlockPermanent, isPending } = useVeIONManage(Number(chain));

  const handleUnlock = async () => {
    if (!address || !selectedManagePosition) return;

    await unlockPermanent({
      tokenId: +selectedManagePosition.id
    });
  };

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <div className="border border-red-500 text-red-500 text-xs flex items-center gap-3 rounded-md py-2.5 px-4 mt-2">
        <InfoIcon className="h-5 w-5 flex-shrink-0" />
        <span>
          Unlocking permanently locked veION is irreversible. Ensure you want to
          proceed.
        </span>
      </div>
      <Button
        className="w-full bg-accent text-black mt-4"
        disabled={isPending || !address}
        onClick={handleUnlock}
      >
        {isPending ? 'Unlocking...' : 'Unlock veION'}
      </Button>
    </div>
  );
}
