import { useState } from 'react';

import { format } from 'date-fns';
import { InfoIcon } from 'lucide-react';
import { useAccount } from 'wagmi';

import TransactionButton from '@ui/components/TransactionButton';
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

import InfoVoted from './InfoVoted';
import CustomTooltip from '../../CustomTooltip';

export function Merge() {
  const [selectedLp, setSelectedLp] = useState<string>('');
  const { address } = useAccount();
  const { locks, selectedManagePosition, setSelectedManagePosition } =
    useVeIONContext();
  const chain = Number(selectedManagePosition?.chainId);
  const hasVoted = !!selectedManagePosition?.votingStatus.hasVoted;

  const { handleMerge } = useVeIONManage(Number(chain));

  const availableLPs = locks.myLocks
    .filter((lock) => lock.id !== selectedManagePosition?.id)
    .map((lock) => ({
      id: lock.id,
      votingPower: lock.votingPower,
      lockedUntil: new Date(lock.lockExpires.date)
    }));

  const hasAvailablePositions = availableLPs.length > 0;
  const selectedLpData = availableLPs.find((lp) => lp.id === selectedLp);

  const onMerge = async () => {
    if (!selectedLp || !selectedManagePosition?.id) {
      return { success: false };
    }

    const success = await handleMerge({ toTokenId: selectedLp });

    const mergingInto = locks.myLocks.find((lock) => lock.id === selectedLp);

    if (mergingInto) setSelectedManagePosition(mergingInto);

    return { success };
  };

  return (
    <div className="flex flex-col gap-y-4 py-2 px-3">
      {hasVoted && <InfoVoted />}

      {!hasAvailablePositions ? (
        <div className="text-sm text-white/70 bg-white/5 rounded-md p-4 text-center">
          No positions available to merge
        </div>
      ) : (
        <div>
          <p className="text-[10px] text-white/50 pb-2">
            Select veION to merge into
          </p>

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
        </div>
      )}

      <div className="border border-yellow-200 text-yellow-200 text-xs flex items-center gap-3 rounded-md py-2.5 px-4 mt-2">
        <InfoIcon className="h-5 w-5 flex-shrink-0" />
        <span>
          {selectedLpData?.id
            ? `Position #${selectedManagePosition?.id} will be merged into position #${selectedLpData.id}. The original position will be burned, and the lock duration will be set to the longer of the two periods.`
            : `Select a position to merge into. Your current position #${selectedManagePosition?.id} will be merged into the selected position, and the lock duration will be set to the longer of the two periods.`}
        </span>
      </div>

      <Separator className="bg-white/10 my-2" />

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

      <TransactionButton
        onSubmit={onMerge}
        isDisabled={!hasAvailablePositions || !selectedLp || !address}
        buttonText={hasAvailablePositions ? 'Merge' : 'No Positions Available'}
        targetChainId={chain}
      />
    </div>
  );
}
