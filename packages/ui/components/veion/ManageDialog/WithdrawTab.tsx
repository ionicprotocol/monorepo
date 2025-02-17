import { InfoIcon } from 'lucide-react';
import { useAccount } from 'wagmi';

import TransactionButton from '@ui/components/TransactionButton';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';

import InfoVoted from './InfoVoted';

export function WithdrawTab({ closeDialog }: { closeDialog: () => void }) {
  const { selectedManagePosition } = useVeIONContext();
  const { address } = useAccount();
  const chain = Number(selectedManagePosition?.chainId);
  const { handleWithdraw } = useVeIONManage(Number(chain));

  const hasVoted = !!selectedManagePosition?.votingStatus.hasVoted;

  const onWithdraw = async () => {
    if (!address || !selectedManagePosition) {
      return { success: false };
    }

    const success = await handleWithdraw();

    closeDialog();
    return { success };
  };

  return (
    <div className="flex flex-col gap-y-4 py-2 px-3">
      {hasVoted && <InfoVoted />}
      <div className="border border-red-500 text-red-500 text-xs flex items-center gap-3 rounded-md py-2.5 px-4">
        <InfoIcon className="h-5 w-5 flex-shrink-0" />
        <span>
          Withdrawing veION before the lock expires incurs a penalty. 25% of the
          penalty goes to the protocol, and 75% is redistributed to other users.
        </span>
      </div>
      <TransactionButton
        onSubmit={onWithdraw}
        isDisabled={!address || hasVoted}
        buttonText="Withdraw veION"
        targetChainId={chain}
      />
    </div>
  );
}
