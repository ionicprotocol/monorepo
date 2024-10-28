'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@ui/components/ui/table';
import { Checkbox } from '@ui/components/ui/checkbox';
import Image from 'next/image';
import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@ui/components/ui/dialog';
import { claimRewards } from '@ui/constants/mock';
import { TableActionButton } from '../TableActionButton';

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

// Table Components
interface RewardItem {
  id: string;
  token: string;
  tokenSymbol: string;
  amount: number;
  network: 'Mode' | 'Base';
  section: 'Market Emissions' | 'Protocol Bribes' | 'Locked LP Emissions';
}

const RewardsTable = ({
  rewards,
  section
}: {
  rewards: RewardItem[];
  section: string;
}) => {
  const { selectedRewards, toggleReward } = useClaimContext();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold pl-4">{section}</h3>
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Network</TableHead>
              <TableHead className="w-[100px]">Select</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.map((reward) => (
              <TableRow
                key={reward.id}
                transparent
                compact
              >
                <TableCell compact>
                  <div className="flex items-center gap-2">
                    <Image
                      alt={`${reward.token.toLowerCase()} logo`}
                      src={`/img/symbols/32/color/${reward.token.toLowerCase()}.png`}
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
                <TableCell compact>{reward.amount}</TableCell>
                <TableCell compact>
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
                <TableCell compact>
                  <Checkbox
                    checked={selectedRewards[reward.id]}
                    onCheckedChange={() => toggleReward(reward.id)}
                    className="border-gray-600 rounded-sm"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Main Component
const UniversalClaim = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ClaimProvider>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DialogTrigger asChild>
          <TableActionButton adaptive>Claim All Rewards</TableActionButton>
        </DialogTrigger>
        <DialogContent className="bg-grayone border border-grayUnselect sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 mb-6">
              <div className="bg-black rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-green-400 text-xl">⟲</span>
              </div>
              <span className="text-2xl">Claim Rewards</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            {(
              [
                'Market Emissions',
                'Protocol Bribes',
                'Locked LP Emissions'
              ] as const
            ).map((section) => (
              <RewardsTable
                key={section}
                rewards={claimRewards.filter(
                  (reward) => reward.section === section
                )}
                section={section}
              />
            ))}

            <ClaimFooter onClose={() => setIsOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </ClaimProvider>
  );
};

const ClaimFooter = ({ onClose }: { onClose: () => void }) => {
  const { getSelectedCount, clearSelections } = useClaimContext();

  const handleClaim = async () => {
    // Handle claim logic
    console.log('Claiming rewards...');
    clearSelections();
    onClose();
  };

  return (
    <Button
      className="w-full bg-green-400 hover:bg-green-500 text-black rounded-xl h-12 text-lg font-medium"
      onClick={handleClaim}
      disabled={getSelectedCount() === 0}
    >
      Claim Selected ({getSelectedCount()})
    </Button>
  );
};

export default UniversalClaim;
