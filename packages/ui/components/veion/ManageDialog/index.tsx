'use client';

import { useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { format } from 'date-fns';
import { useChainId } from 'wagmi';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';

import { Delegate } from './Delegate';
import { Extend } from './Extend';
import { IncreaseLockedAmount } from './IncreaseLockedAmount';
import { ManageTabs } from './ManageTabs';
import { MergeLps } from './MergeLps';
import { SplitLp } from './SplitLp';
import { Transfer } from './Transfer';

interface ManageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageDialog({
  isOpen,
  onOpenChange
}: ManageDialogProps) {
  const toggleArr = [
    'Increase',
    'Extend',
    'Delegate',
    'Merge',
    'Split',
    'Transfer'
  ];

  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : String(chainId);
  const [activeManageToggle, setActiveManageToggle] = useState<string>(
    toggleArr[0]
  );

  const lockedUntil = new Date('2023-08-28');

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-grayone border border-grayUnselect sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage veION #12</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 text-xs mb-3">
          <span className="text-white/50">Voting Power: 20.00 veION</span>
          <span className="text-white/50">
            Locked Until: {format(lockedUntil, 'dd MMM yyyy')}
          </span>
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
        {activeManageToggle === 'Merge' && (
          <MergeLps
            lockedUntil={lockedUntil}
            chain={chain}
          />
        )}
        {activeManageToggle === 'Split' && <SplitLp chain={chain} />}
        {activeManageToggle === 'Transfer' && <Transfer chain={chain} />}
      </DialogContent>
    </Dialog>
  );
}
