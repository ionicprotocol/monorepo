'use client';

import React, { createContext, useContext, useState } from 'react';

import Image from 'next/image';

import { Button } from '@ui/components/ui/button';
import { Checkbox } from '@ui/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@ui/components/ui/table';
import { useToast } from '@ui/hooks/use-toast';
import type { CategoryReward } from '@ui/hooks/veion/useVeionUniversalClaim';
import { useVeionUniversalClaim } from '@ui/hooks/veion/useVeionUniversalClaim';

// Types
interface ClaimContextType {
  selectedRewards: Record<string, boolean>;
  toggleReward: (id: string) => void;
  clearSelections: () => void;
  getSelectedCount: () => number;
}

// Context
const ClaimContext = createContext<ClaimContextType | null>(null);

export const useClaimContext = () => {
  const context = useContext(ClaimContext);
  if (!context) {
    throw new Error('useClaimContext must be used within a ClaimProvider');
  }
  return context;
};

// Provider Component
interface ClaimProviderProps {
  children: React.ReactNode;
}

export const ClaimProvider = ({ children }: ClaimProviderProps) => {
  const [selectedRewards, setSelectedRewards] = useState<
    Record<string, boolean>
  >({});

  const toggleReward = (id: string) => {
    setSelectedRewards((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const clearSelections = () => {
    setSelectedRewards({});
  };

  const getSelectedCount = () => {
    return Object.values(selectedRewards).filter(Boolean).length;
  };

  return (
    <ClaimContext.Provider
      value={{
        selectedRewards,
        toggleReward,
        clearSelections,
        getSelectedCount
      }}
    >
      {children}
    </ClaimContext.Provider>
  );
};

// Main Component
interface ClaimDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chainIds: number[];
  mode?: 'all' | 'selective'; // selective allows choosing rewards, all claims everything
}

export const UniversalClaimDialog = ({
  isOpen,
  onClose,
  chainIds,
  mode = 'selective'
}: ClaimDialogProps) => {
  const [selectedRewards, setSelectedRewards] = useState<
    Record<string, boolean>
  >({});
  const { rewards, isLoading, claimRewards } = useVeionUniversalClaim(chainIds);
  const { toast } = useToast();
  const [isClaimLoading, setIsClaimLoading] = useState(false);

  const sections: CategoryReward['section'][] = [
    'Market Emissions',
    'Protocol Bribes',
    'Locked LP Emissions'
  ];

  const handleClaim = async () => {
    try {
      setIsClaimLoading(true);
      if (mode === 'selective') {
        const selectedIds = Object.entries(selectedRewards)
          .filter(([_, isSelected]) => isSelected)
          .map(([id]) => id);
        await claimRewards(selectedIds);
      } else {
        await claimRewards(); // Claim all rewards
      }

      toast({
        title: 'Success',
        description: 'Successfully claimed rewards'
      });

      setSelectedRewards({});
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsClaimLoading(false);
    }
  };

  const toggleReward = (id: string) => {
    setSelectedRewards((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getSelectedCount = () =>
    Object.values(selectedRewards).filter(Boolean).length;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="bg-grayone border border-grayUnselect sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 mb-6">
            <div className="bg-black rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-green-400 text-xl">⟲</span>
            </div>
            <span className="text-2xl">Claim Rewards</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div>Loading rewards...</div>
        ) : (
          <div className="space-y-8">
            {sections.map((section) => (
              <div
                key={section}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold pl-4">{section}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Network</TableHead>
                      {mode === 'selective' && (
                        <TableHead className="w-[100px]">Select</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewards
                      .filter((r) => r.section === section)
                      .map((reward) => (
                        <TableRow key={reward.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Image
                                alt={`${reward.token} logo`}
                                src={`/img/symbols/32/color/${reward.token}.png`}
                                width={16}
                                height={16}
                                className="inline-block"
                                onError={({ currentTarget }) => {
                                  currentTarget.onerror = null;
                                  currentTarget.src = '/img/logo/ion.svg';
                                }}
                                unoptimized
                              />
                              <span>{reward.tokenSymbol}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {Number(reward.amount).toFixed(6)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Image
                                alt={`${reward.network.toLowerCase()} network`}
                                src={`/img/logo/${reward.network.toUpperCase()}.png`}
                                width={14}
                                height={14}
                                className="rounded-full"
                                unoptimized
                              />
                              <span>{reward.network}</span>
                            </div>
                          </TableCell>
                          {mode === 'selective' && (
                            <TableCell>
                              <Checkbox
                                checked={selectedRewards[reward.id]}
                                onCheckedChange={() => toggleReward(reward.id)}
                                className="border-gray-600 rounded-sm"
                              />
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ))}

            <Button
              className="w-full bg-green-400 hover:bg-green-500 text-black rounded-xl h-12 text-lg font-medium"
              onClick={handleClaim}
              disabled={
                isClaimLoading ||
                (mode === 'selective' && getSelectedCount() === 0)
              }
            >
              {mode === 'selective'
                ? `Claim Selected (${getSelectedCount()})`
                : 'Claim All Rewards'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UniversalClaimDialog;
