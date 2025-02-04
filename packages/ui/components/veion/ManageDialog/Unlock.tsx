import { InfoIcon, LockIcon } from 'lucide-react';
import { useAccount } from 'wagmi';

import TransactionButton from '@ui/components/TransactionButton';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';

export function Unlock() {
  const { selectedManagePosition } = useVeIONContext();
  const chain = Number(selectedManagePosition?.chainId);
  const { address } = useAccount();
  const { handleUnlockPermanent, handleLockPermanent } = useVeIONManage(
    Number(chain)
  );
  const isPermanent = selectedManagePosition?.lockExpires.isPermanent;

  const onUnlock = async () => {
    if (!address || !selectedManagePosition) {
      return { success: false };
    }
    const success = await handleUnlockPermanent();
    return { success };
  };

  const onLock = async () => {
    if (!address || !selectedManagePosition) {
      return { success: false };
    }
    const success = await handleLockPermanent();
    return { success };
  };

  return (
    <div className="flex flex-col gap-y-4 py-2 px-3">
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
          <TransactionButton
            onSubmit={onUnlock}
            isDisabled={!address}
            buttonText="Unlock veION"
          />
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
          <TransactionButton
            onSubmit={onLock}
            isDisabled={!address}
            buttonText="Lock veION"
            targetChainId={chain}
          />
        </>
      )}
    </div>
  );
}
