import { useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { format } from 'date-fns';
import { Lock } from 'lucide-react';
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
import { Increase } from './Increase';
import { ManageTabs } from './ManageTabs';
import { Merge } from './Merge';
import { Split } from './Split';
import { Transfer } from './Transfer';
import { Unlock } from './Unlock';
import { Withdraw } from './WIthdraw';

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

  const toggleArr = [
    { value: 'Increase' as TabValue, label: 'Increase' },
    { value: 'Extend' as TabValue, label: 'Extend' },
    { value: 'Delegate' as TabValue, label: 'Delegate' },
    { value: 'Merge' as TabValue, label: 'Merge' },
    { value: 'Split' as TabValue, label: 'Split' },
    { value: 'Transfer' as TabValue, label: 'Transfer' },
    { value: 'Withdraw' as TabValue, label: 'Withdraw' },
    { value: 'Unlock' as TabValue, label: <Lock className="h-4 w-4" /> }
  ];

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedManagePosition(null);
      setActiveManageToggle(DEFAULT_TAB);
    }
    onOpenChange(open);
  };

  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : String(chainId);

  const lockedUntil = selectedManagePosition?.lockExpires.date
    ? new Date(selectedManagePosition.lockExpires.date)
    : new Date();

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

            {selectedManagePosition?.lockExpires.isPermanent ? (
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
          onTabChange={(value: string) =>
            setActiveManageToggle(value as TabValue)
          }
        />

        {activeManageToggle === 'Increase' && <Increase chain={chain} />}
        {activeManageToggle === 'Extend' && <Extend chain={chain} />}
        {activeManageToggle === 'Delegate' && <Delegate chain={chain} />}
        {activeManageToggle === 'Merge' && <Merge chain={chain} />}
        {activeManageToggle === 'Split' && <Split chain={chain} />}
        {activeManageToggle === 'Transfer' && <Transfer chain={chain} />}
        {activeManageToggle === 'Withdraw' && <Withdraw chain={chain} />}
        {activeManageToggle === 'Unlock' && <Unlock chain={chain} />}
      </DialogContent>
    </Dialog>
  );
}
