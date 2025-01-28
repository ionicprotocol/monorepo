import { useState } from 'react';

import { format } from 'date-fns';
import { InfoIcon } from 'lucide-react';
import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ui/components/ui/select';
import { Separator } from '@ui/components/ui/separator';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';

import CustomTooltip from '../../CustomTooltip';

type MergeProps = {
  chain: string;
};

export function Merge({ chain }: MergeProps) {
  const [selectedLp, setSelectedLp] = useState<string>('');

  const { address } = useAccount();
  const { merge, isPending } = useVeIONManage(Number(chain));
  const { locks, selectedManagePosition } = useVeIONContext();

  const availableLPs = locks.myLocks
    .filter((lock) => lock.id !== selectedManagePosition?.id)
    .map((lock) => ({
      id: lock.id,
      votingPower: lock.votingPower,
      lockedUntil: new Date(lock.lockExpires.date)
    }));

  const hasAvailablePositions = availableLPs.length > 0;
  const selectedLpData = availableLPs.find((lp) => lp.id === selectedLp);

  const handleMerge = async () => {
    if (!selectedLp || !selectedManagePosition?.id) return;

    await merge({
      fromTokenId: selectedManagePosition?.id,
      toTokenId: selectedLp
    });
  };

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <p className="text-[10px] text-white/50">Select veION to merge from</p>

      {!hasAvailablePositions ? (
        <div className="text-sm text-white/70 bg-white/5 rounded-md p-4 text-center">
          No positions available to merge
        </div>
      ) : (
        <Select
          onValueChange={setSelectedLp}
          value={selectedLp}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select LP position" />
          </SelectTrigger>
          <SelectContent>
            {availableLPs.map((lp) => (
              <SelectItem
                key={lp.id}
                value={lp.id}
              >
                #{lp.id} - {lp.votingPower}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="border border-yellow-200 text-yellow-200 text-xs flex items-center gap-3 rounded-md py-2.5 px-4 mt-2">
        <InfoIcon className="h-5 w-5 flex-shrink-0" />
        <span>
          Positions get merged to the selected tokenID ({selectedLpData?.id}),
          the current one is burned and lock is set to the one further in the
          future.
        </span>
      </div>

      <Separator className="bg-white/10 my-5" />

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-2">
          VOTING POWER
          <CustomTooltip content="Your voting power diminishes each day closer to the end of the token lock period." />
        </div>
        <p>{selectedLpData?.votingPower || '0.00'} veIon</p>
      </div>

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        LOCKED Until
        <p>
          {selectedLpData?.lockedUntil
            ? format(selectedLpData.lockedUntil, 'dd MMM yyyy')
            : 'N/A'}
        </p>
      </div>

      <Button
        className="w-full bg-accent text-black mt-4"
        disabled={
          !hasAvailablePositions || !selectedLp || !address || isPending
        }
        onClick={handleMerge}
      >
        {isPending
          ? 'Merging...'
          : hasAvailablePositions
            ? 'Merge'
            : 'No Positions Available'}
      </Button>
    </div>
  );
}
