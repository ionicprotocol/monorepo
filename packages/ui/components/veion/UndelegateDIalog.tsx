import { useState } from 'react';

import { InfoIcon, ChevronDown } from 'lucide-react';
import { formatUnits, parseUnits } from 'viem';
import { useAccount } from 'wagmi';

import TransactionButton from '@ui/components/TransactionButton';
import { Button } from '@ui/components/ui/button';
import { Checkbox } from '@ui/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@ui/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Input } from '@ui/components/ui/input';
import { Slider } from '@ui/components/ui/slider';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';
import type { ChainId } from '@ui/types/veION';

import { BadgePositionTitle } from './DelegatedToCell';

interface DelegatePosition {
  id: string;
  chainId: ChainId;
  delegation: {
    delegatedTo: number[];
    amounts: string[];
  };
}

interface UndelegateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  position: DelegatePosition;
  onSuccess?: () => void;
}

export default function UndelegateDialog({
  isOpen,
  onClose,
  position,
  onSuccess
}: UndelegateDialogProps) {
  const [selectedPositions, setSelectedPositions] = useState<
    Record<number, boolean>
  >({});
  const [undelegateAmounts, setUndelegateAmounts] = useState<
    Record<number, string>
  >({});
  const [openPositions, setOpenPositions] = useState<Record<number, boolean>>(
    {}
  );

  const { address } = useAccount();
  const { handleUndelegate } = useVeIONManage(position.chainId);

  const togglePosition = (id: number, checked: boolean) => {
    setSelectedPositions((prev) => ({ ...prev, [id]: checked }));
    if (!checked) {
      setUndelegateAmounts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setOpenPositions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setUndelegateAmounts((prev) => ({ ...prev, [id]: '0' }));
      setOpenPositions((prev) => ({ ...prev, [id]: true }));
    }
  };

  const handleSliderChange = (id: number, values: number[]) => {
    const index = position.delegation.delegatedTo.indexOf(id);
    const maxAmount = position.delegation.amounts[index];
    const percentage = values[0];

    // If slider is at 100%, use the exact maxAmount to avoid dust
    if (percentage === 100) {
      setUndelegateAmounts((prev) => ({ ...prev, [id]: maxAmount }));
    } else {
      const amount = (BigInt(maxAmount) * BigInt(percentage)) / BigInt(100);
      setUndelegateAmounts((prev) => ({ ...prev, [id]: amount.toString() }));
    }
  };

  const handleInputChange = (id: number, value: string) => {
    try {
      const index = position.delegation.delegatedTo.indexOf(id);
      const maxAmount = position.delegation.amounts[index];
      const maxAmountFormatted = formatUnits(BigInt(maxAmount), 18);

      if (!value || value === '') {
        setUndelegateAmounts((prev) => ({ ...prev, [id]: '0' }));
        return;
      }

      // If input equals max formatted value, use exact maxAmount
      if (value === maxAmountFormatted) {
        setUndelegateAmounts((prev) => ({ ...prev, [id]: maxAmount }));
        return;
      }

      const parsedAmount = parseUnits(value, 18);
      if (parsedAmount > BigInt(maxAmount)) {
        setUndelegateAmounts((prev) => ({ ...prev, [id]: maxAmount }));
      } else {
        setUndelegateAmounts((prev) => ({
          ...prev,
          [id]: parsedAmount.toString()
        }));
      }
    } catch {
      // Invalid input - keep previous value
    }
  };

  // Helper function to set max amount
  const setMaxAmount = (id: number) => {
    const index = position.delegation.delegatedTo.indexOf(id);
    const maxAmount = position.delegation.amounts[index];
    setUndelegateAmounts((prev) => ({ ...prev, [id]: maxAmount }));
  };

  const selectedIds = position.delegation.delegatedTo.filter(
    (id) => selectedPositions[id]
  );
  const amounts = selectedIds.map((id) => undelegateAmounts[id] || '0');
  const selectedCount = Object.values(selectedPositions).filter(Boolean).length;
  const hasValidAmounts = selectedIds.every(
    (id) => BigInt(undelegateAmounts[id] || '0') > BigInt(0)
  );

  const onUndelegateSubmit = async () => {
    if (!address || selectedIds.length === 0) return { success: false };

    const success = await handleUndelegate({
      toIds: selectedIds,
      amounts,
      id: position.id
    });

    if (success) {
      onSuccess?.();
      onClose();
    }

    return { success };
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Undelegate veION Positions</DialogTitle>
          <DialogDescription>
            Select positions and amounts to undelegate from your veION position
            #{position.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="border rounded-lg divide-y divide-white/10 max-h-96 overflow-y-auto">
            {position.delegation.delegatedTo.map((delegatedId, index) => {
              const maxAmount = position.delegation.amounts[index];
              const currentAmount = undelegateAmounts[delegatedId] || '0';
              const isSelected = selectedPositions[delegatedId];
              const isOpen = openPositions[delegatedId];
              const maxAmountFormatted = formatUnits(BigInt(maxAmount), 18);
              const currentAmountFormatted = formatUnits(
                BigInt(currentAmount),
                18
              );
              const percentage = Number(
                (BigInt(currentAmount) * BigInt(100)) / BigInt(maxAmount)
              );

              return (
                <div
                  key={delegatedId}
                  className="p-3"
                >
                  <Collapsible open={isOpen && isSelected}>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`position-${delegatedId}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          togglePosition(delegatedId, checked as boolean)
                        }
                        className="h-4 w-4"
                      />
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BadgePositionTitle
                              chainId={position.chainId}
                              position={delegatedId}
                            />
                            <span className="text-xs text-white/60">
                              {maxAmountFormatted} BLP
                            </span>
                          </div>
                          {isSelected && (
                            <CollapsibleTrigger className="ml-2">
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                              />
                            </CollapsibleTrigger>
                          )}
                        </div>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="pl-7 pt-3 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-1 max-w-[8rem]">
                            <Input
                              type="number"
                              value={Number(currentAmountFormatted)}
                              onChange={(e) =>
                                handleInputChange(delegatedId, e.target.value)
                              }
                              min={0}
                              max={Number(maxAmountFormatted)}
                              step={0.0001}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMaxAmount(delegatedId)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs text-primary hover:text-primary/80"
                            >
                              MAX
                            </Button>
                          </div>
                          <span className="text-sm text-white/60">BLP</span>
                          <span className="text-sm text-white/60">
                            ({percentage}%)
                          </span>
                        </div>
                        <Slider
                          value={[percentage]}
                          onValueChange={(values) =>
                            handleSliderChange(delegatedId, values)
                          }
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 rounded-md p-2.5">
            <InfoIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs">
              Undelegating will remove your voting power delegation for the
              selected amounts
            </span>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <TransactionButton
              onSubmit={onUndelegateSubmit}
              isDisabled={selectedCount === 0 || !hasValidAmounts || !address}
              buttonText={`Undelegate ${selectedCount} Position${selectedCount !== 1 ? 's' : ''}`}
              className="flex-1"
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
