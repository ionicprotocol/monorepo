import { useState } from 'react';

import { format } from 'date-fns';
import { Lock } from 'lucide-react';

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
import { Increase } from './Increase';
import { ManageTabs } from './ManageTabs';
import { Merge } from './Merge';
import { Split } from './Split';
import { Transfer } from './Transfer';
import { Unlock } from './Unlock';
import { WithdrawTab } from './WithdrawTab';

interface ManageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabValue =
  | 'Delegate'
  | 'Extend'
  | 'Increase'
  | 'Merge'
  | 'Split'
  | 'Transfer'
  | 'Unlock'
  | 'Withdraw';

const DEFAULT_TAB: TabValue = 'Increase';

export default function ManageDialog({
  isOpen,
  onOpenChange
}: ManageDialogProps) {
  const { selectedManagePosition, setSelectedManagePosition } =
    useVeIONContext();
  const [activeManageToggle, setActiveManageToggle] =
    useState<TabValue>(DEFAULT_TAB);

  const isPermanent = selectedManagePosition?.lockExpires.isPermanent;

  const toggleArr = [
    { value: 'Increase', label: 'Increase' },
    {
      value: 'Extend',
      label: 'Extend',
      disabled: isPermanent,
      tooltip: isPermanent
        ? 'This position is permanently locked and cannot be extended'
        : undefined
    },
    { value: 'Delegate', label: 'Delegate' },
    { value: 'Merge', label: 'Merge' },
    { value: 'Split', label: 'Split' },
    { value: 'Transfer', label: 'Transfer' },
    { value: 'Withdraw', label: 'Withdraw' },
    { value: 'Unlock', label: <Lock className="h-4 w-4" /> }
  ];

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedManagePosition(null);
      setActiveManageToggle(DEFAULT_TAB);
    }
    onOpenChange(open);
  };

  const lockedUntil = selectedManagePosition?.lockExpires.date
    ? new Date(selectedManagePosition.lockExpires.date)
    : new Date();

  const handleTabChange = (value: string) => {
    const tab = toggleArr.find((t) => t.value === value);
    if (!tab?.disabled) {
      setActiveManageToggle(value as TabValue);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="bg-grayone border border-grayUnselect">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Manage veION #{selectedManagePosition?.id}</DialogTitle>
          <div className="flex items-center gap-2 text-xs mr-6 mt-0">
            <span className="text-white/50">
              {selectedManagePosition?.votingPower.toFixed(4)} (
              {selectedManagePosition?.votingBoost.toFixed(2)}x)
            </span>

            {isPermanent ? (
              <Badge className="text-xs font-medium">Permanent</Badge>
            ) : (
              <span className="text-white/50">
                Locked Until: {format(lockedUntil, 'dd MMM yyyy')}
              </span>
            )}
          </div>
        </DialogHeader>

        <ManageTabs
          tabs={toggleArr}
          activeTab={activeManageToggle}
          onTabChange={handleTabChange}
        />

        {activeManageToggle === 'Increase' && <Increase />}
        {activeManageToggle === 'Extend' && <Extend />}
        {activeManageToggle === 'Delegate' && <Delegate />}
        {activeManageToggle === 'Merge' && <Merge />}
        {activeManageToggle === 'Split' && <Split />}
        {activeManageToggle === 'Transfer' && <Transfer />}
        {activeManageToggle === 'Withdraw' && <WithdrawTab />}
        {activeManageToggle === 'Unlock' && <Unlock />}
      </DialogContent>
    </Dialog>
  );
}
