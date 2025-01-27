import { InfoIcon } from 'lucide-react';
import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';

type WithdrawProps = {
  chain: string;
};

export function Withdraw({ chain }: WithdrawProps) {
  const { selectedManagePosition } = useVeIONContext();
  const { address } = useAccount();
  const { withdraw, isPending } = useVeIONManage(Number(chain));

  const handleWithdraw = async () => {
    if (!address || !selectedManagePosition) return;

    await withdraw({
      tokenId: +selectedManagePosition.id
    });
  };

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <div className="border border-red-500 text-red-500 text-xs flex items-center gap-3 rounded-md py-2.5 px-4 mt-2">
        <InfoIcon className="h-5 w-5 flex-shrink-0" />
        <span>
          Withdrawing veION before the lock expires incurs a penalty. 25% of the
          penalty goes to the protocol, and 75% is redistributed to other users.
        </span>
      </div>
      <Button
        className="w-full bg-accent text-black mt-4"
        disabled={isPending || !address}
        onClick={handleWithdraw}
      >
        {isPending ? 'Withdrawing...' : 'Withdraw veION'}
      </Button>
    </div>
  );
}
