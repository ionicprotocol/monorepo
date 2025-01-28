import { InfoIcon, LockIcon } from 'lucide-react';
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
  const { unlockPermanent, lockPermanent, isPending } = useVeIONManage(
    Number(chain)
  );
  const isPermanent = selectedManagePosition?.lockExpires.isPermanent;

  const handleUnlock = async () => {
    if (!address || !selectedManagePosition) return;

    await unlockPermanent({
      tokenId: +selectedManagePosition.id
    });
  };

  const handleLock = async () => {
    if (!address || !selectedManagePosition) return;

    await lockPermanent({
      tokenId: +selectedManagePosition.id
    });
  };

  return (
    <div className="flex flex-col gap-y-4 py-2 px-3">
      {/* Main info section always shown at top */}
      <div className="border border-yellow-200 text-yellow-200 text-xs flex items-center gap-3 rounded-md py-2.5 px-4">
        <InfoIcon className="h-5 w-5 flex-shrink-0" />
        <div className="space-y-2">
          <p>
            <strong>Permanent Lock Benefits:</strong>
            <br />
            • Increases veION bonus to 2x
            <br />
            • Enables delegation capabilities
            <br />• Allows your position to be a delegate
          </p>
          <p>
            <strong>Important:</strong>
            <br />
            • You can unlock your position at any time
            <br />
            • Unlocking will remove delegation capabilities
            <br />
            • Your veION bonus will return to normal after unlocking
            <br />• After unlocking, your position will have a 2-year lock
            period
          </p>
        </div>
      </div>

      {isPermanent ? (
        <>
          <div className="border border-gray-500 bg-gray-800/50 text-gray-300 text-xs flex items-center gap-3 rounded-md py-2.5 px-4">
            <LockIcon className="h-5 w-5 flex-shrink-0" />
            <div>
              This position is currently permanently locked, giving you 2x veION
              bonus and delegation capabilities. Unlocking will convert it to a
              2-year lock.
            </div>
          </div>
          <Button
            className="w-full bg-accent text-black"
            disabled={isPending || !address}
            onClick={handleUnlock}
          >
            {isPending ? 'Unlocking...' : 'Unlock veION'}
          </Button>
        </>
      ) : (
        <>
          <div className="border border-yellow-200 bg-yellow-950/20 text-yellow-200 text-xs flex items-center gap-3 rounded-md py-2.5 px-4">
            <LockIcon className="h-5 w-5 flex-shrink-0" />
            <div>
              Lock this position permanently to receive 2x veION bonus and
              enable delegation capabilities.
            </div>
          </div>
          <Button
            className="w-full bg-yellow-200 text-black hover:bg-yellow-300"
            disabled={isPending || !address}
            onClick={handleLock}
          >
            <LockIcon className="h-4 w-4 mr-2" />
            {isPending ? 'Locking...' : 'Lock veION'}
          </Button>
        </>
      )}
    </div>
  );
}
