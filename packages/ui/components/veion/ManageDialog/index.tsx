import { useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { format } from 'date-fns';
import { useChainId } from 'wagmi';

import { Badge } from '@ui/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { useVeIONContext } from '@ui/context/VeIonContext';

import { Delegate } from './Delegate';
import { Extend } from './Extend';
import { IncreaseLockedAmount } from './IncreaseLockedAmount';
import { ManageTabs } from './ManageTabs';
import { MergeLps } from './MergeLps';
import { SplitLp } from './SplitLp';
import { Transfer } from './Transfer';
import { Withdraw } from './WIthdraw';

interface ManageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageDialog({
  isOpen,
  onOpenChange
}: ManageDialogProps) {
  const { selectedManagePosition, setSelectedManagePosition } =
    useVeIONContext();
  const toggleArr = [
    'Increase',
    'Extend',
    'Delegate',
    'Merge',
    'Split',
    'Transfer',
    'Withdraw'
    // 'Unlock'
  ];

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedManagePosition(null);
    }
    onOpenChange(open);
  };

  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : String(chainId);
  const [activeManageToggle, setActiveManageToggle] = useState<string>(
    toggleArr[0]
  );

  const lockedUntil = selectedManagePosition?.lockExpires.date
    ? new Date(selectedManagePosition.lockExpires.date)
    : new Date();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="bg-grayone border border-grayUnselect">
        <DialogHeader>
          <DialogTitle>Manage veION #{selectedManagePosition?.id}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 text-xs mb-3">
          <span className="text-white/50">
            {selectedManagePosition?.votingPower} (
            {selectedManagePosition?.votingBoost.toFixed(2)}x)
          </span>

          {selectedManagePosition?.lockExpires.isPermanent ? (
            <Badge className="text-xs font-medium">Permanent</Badge>
          ) : (
            <span className="text-white/50">
              Locked Until: {format(lockedUntil, 'dd MMM yyyy')}
            </span>
          )}
        </div>

        <ManageTabs
          arrText={toggleArr}
          setActiveToggle={setActiveManageToggle}
          defaultValue={toggleArr[0]}
        />
        {activeManageToggle === 'Increase' && (
          <IncreaseLockedAmount chain={chain} />
        )}
        {activeManageToggle === 'Extend' && <Extend chain={chain} />}
        {activeManageToggle === 'Delegate' && <Delegate chain={chain} />}
        {activeManageToggle === 'Merge' && <MergeLps chain={chain} />}
        {activeManageToggle === 'Split' && <SplitLp chain={chain} />}
        {activeManageToggle === 'Transfer' && <Transfer chain={chain} />}
        {activeManageToggle === 'Withdraw' && <Withdraw chain={chain} />}
        {/* {activeManageToggle === 'Unlock' && <Unlock chain={chain} />} */}
      </DialogContent>
    </Dialog>
  );
}
