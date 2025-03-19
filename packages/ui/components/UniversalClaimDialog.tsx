'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image';

import { GiftIcon, Loader2 } from 'lucide-react';
import { useSwitchChain, useAccount } from 'wagmi';

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
import { chainIdToName } from '@ui/constants';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useRewardsAggregator } from '@ui/hooks/rewards/useRewardsAggregator';
import { useToast } from '@ui/hooks/use-toast';

interface ClaimDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'all' | 'selective';
}

const UniversalClaimDialog = ({
  isOpen,
  onClose,
  mode = 'selective'
}: ClaimDialogProps) => {
  const [selectedRewards, setSelectedRewards] = useState<
    Record<string, boolean>
  >({});
  const { rewards, isLoading, claimRewards } = useRewardsAggregator();
  const { currentChain } = useVeIONContext();
  const { toast } = useToast();
  const [isClaimLoading, setIsClaimLoading] = useState(false);

  // Network switching functionality
  const { chain } = useAccount();
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();
  const isWrongNetwork = chain?.id !== Number(currentChain);

  const sections = [
    'Market Emissions',
    'Protocol Bribes',
    'Locked LP Emissions'
  ];

  // Reset selections on chain switch
  useEffect(() => {
    setSelectedRewards({});
  }, [currentChain]);

  const handleClaim = async () => {
    // Check if user is on the correct network
    if (isWrongNetwork) {
      toast({
        title: 'Wrong Network',
        description: `Please switch to ${chainIdToName[currentChain]} network first.`,
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsClaimLoading(true);
      if (mode === 'selective') {
        const selectedIds = Object.entries(selectedRewards)
          .filter(([_, isSelected]) => isSelected)
          .map(([id]) => id);
        await claimRewards(selectedIds);
      } else {
        await claimRewards();
      }
      toast({ title: 'Success', description: 'Successfully claimed rewards' });
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

  const handleSwitchNetwork = () => {
    try {
      switchChain({ chainId: Number(currentChain) });
    } catch (error) {
      toast({
        title: 'Network Switch Failed',
        description: 'Please try switching networks manually in your wallet',
        variant: 'destructive'
      });
    }
  };

  const toggleReward = (id: string) => {
    setSelectedRewards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getSelectedCount = () =>
    Object.values(selectedRewards).filter(Boolean).length;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="flex flex-col bg-black bg-opacity-90 border border-white/10 shadow-2xl backdrop-blur-lg w-full max-w-[520px] p-0 gap-0">
        <div className="p-4 bg-black/50 border-b border-white/10 rounded-t-full">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-accent bg-clip-text text-transparent flex items-center gap-2">
              <GiftIcon className="size-5 text-white" /> Claim Rewards
            </DialogTitle>
            <p className="text-sm text-white/60">
              Claim your earned rewards from various protocol activities on{' '}
              {chainIdToName[currentChain]}
            </p>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-white/60">
            Loading rewards...
          </div>
        ) : (
          <>
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
              {sections.map((section) => (
                <div key={section}>
                  <h3 className="text-sm font-medium text-white/80 mb-2">
                    {section}
                  </h3>
                  <div className="bg-white/5 rounded-lg py-1 px-2">
                    <Table
                      role="table"
                      aria-label="Rewards available for claiming"
                    >
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-white/60 py-2 text-xs">
                            Token
                          </TableHead>
                          <TableHead className="text-white/60 py-2 text-xs">
                            Amount
                          </TableHead>
                          <TableHead className="text-white/60 py-2 text-xs">
                            Network
                          </TableHead>
                          {mode === 'selective' && (
                            <TableHead className="text-white/60 w-[60px] py-2 text-xs">
                              Select
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rewards
                          .filter((r) => r.section === section)
                          .map((reward) => (
                            <TableRow
                              key={reward.id}
                              className="border-white/10 hover:bg-white/5"
                            >
                              <TableCell className="text-white py-1.5">
                                <div className="flex items-center gap-2">
                                  <Image
                                    alt={`${reward.token} logo`}
                                    src={`/img/symbols/32/color/${reward.token}.png`}
                                    width={16}
                                    height={16}
                                    className="rounded-full"
                                    onError={({ currentTarget }) => {
                                      currentTarget.onerror = null;
                                      currentTarget.src = '/img/logo/ion.svg';
                                    }}
                                    unoptimized
                                  />
                                  <span className="text-sm">
                                    {reward.tokenSymbol}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-white py-1.5 text-sm">
                                {reward.amount}
                              </TableCell>
                              <TableCell className="text-white py-1.5">
                                <div className="flex items-center gap-1.5">
                                  <Image
                                    alt={`${reward.network.toLowerCase()} network`}
                                    src={`/img/logo/${reward.network.toUpperCase()}.png`}
                                    width={14}
                                    height={14}
                                    className="rounded-full"
                                    onError={({ currentTarget }) => {
                                      currentTarget.onerror = null;
                                      currentTarget.src =
                                        '/img/logo/unknown.png';
                                    }}
                                    unoptimized
                                  />
                                  <span className="text-sm">
                                    {reward.network}
                                  </span>
                                </div>
                              </TableCell>
                              {mode === 'selective' && (
                                <TableCell className="py-1.5">
                                  <Checkbox
                                    checked={selectedRewards[reward.id]}
                                    onCheckedChange={() =>
                                      toggleReward(reward.id)
                                    }
                                    className="h-4 w-4 border-white/20 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                  />
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        {rewards.filter((r) => r.section === section).length ===
                          0 && (
                          <TableRow className="border-white/10">
                            <TableCell
                              colSpan={mode === 'selective' ? 4 : 3}
                              className="h-16 text-center"
                            >
                              <span className="text-white/40 text-sm">
                                No rewards available
                              </span>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 mt-auto bg-black/50 border-t border-white/10 rounded-b-full">
              {isWrongNetwork ? (
                // Show network switch button when on wrong network
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl h-10 text-base font-medium transition-all duration-200"
                  onClick={handleSwitchNetwork}
                  disabled={isSwitchingNetwork}
                >
                  {isSwitchingNetwork ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>
                        Switching to {chainIdToName[currentChain]} network...
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>
                        Switch to {chainIdToName[currentChain]} Network First
                      </span>
                    </div>
                  )}
                </Button>
              ) : (
                // Original claim button
                <Button
                  className="w-full bg-accent hover:bg-accent/90 text-black rounded-xl h-10 text-base font-medium transition-all duration-200"
                  onClick={handleClaim}
                  disabled={
                    isClaimLoading ||
                    (mode === 'selective' && getSelectedCount() === 0)
                  }
                >
                  {isClaimLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Processing claim...</span>
                    </div>
                  ) : mode === 'selective' ? (
                    `Claim Selected (${getSelectedCount()})`
                  ) : (
                    'Claim All Rewards'
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UniversalClaimDialog;
