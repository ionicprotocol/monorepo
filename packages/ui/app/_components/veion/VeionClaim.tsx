'use client';

import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { useToast } from '@ui/hooks/use-toast';
import { useVeIONClaim } from '@ui/hooks/veion/useVeIONClaim';

import ProgressSteps from '../xION/ProgressSteps';
import { useVeIONContext } from '@ui/context/VeIonContext';

interface VeionClaimProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId: number;
  lpAmount: string;
  tokenAddress: string;
}

export default function VeionClaim({
  isOpen,
  onOpenChange,
  tokenId,
  lpAmount,
  tokenAddress
}: VeionClaimProps) {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const { currentChain } = useVeIONContext();
  const {
    approve,
    claim,
    resetState,
    progress,
    isApproving,
    isClaiming,
    error
  } = useVeIONClaim(currentChain);

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const handleApproval = async () => {
    if (!isConnected) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive'
      });
      return;
    }

    try {
      const amount = parseUnits(lpAmount, 18);
      await approve(tokenAddress, amount);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleClaim = async () => {
    if (!isConnected) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive'
      });
      return;
    }

    try {
      await claim(tokenAddress, tokenId);

      // Close dialog on successful claim
      setTimeout(() => {
        handleOpenChange(false);
      }, 2000);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="bg-grayUnselect py-4 px-6 rounded-md sm:max-w-[425px] flex flex-col items-center justify-center">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center justify-center">
              <img
                alt="ION"
                className="h-6"
                src="/img/logo/ION.png"
              />
              <img
                alt="ETH"
                className="h-6 -translate-x-1"
                src="/img/logo/ETH.png"
              />
            </div>
          </DialogTitle>
        </DialogHeader>
        <p>Claim ION/ETH Balancer LP</p>
        <p className="text-white/50 text-[10px]">
          Return veION #{String(tokenId).padStart(4, '0')} and receive{' '}
          {lpAmount} LP
        </p>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="w-full flex justify-between items-center mb-2 mt-4 gap-2">
          <Button
            onClick={handleApproval}
            className="w-full bg-accent text-black"
            disabled={isApproving || isClaiming || progress >= 2}
          >
            {isApproving ? 'Approving...' : 'Approve'}
          </Button>
          <Button
            onClick={handleClaim}
            className="w-full bg-accent text-black"
            disabled={isApproving || isClaiming || progress < 2}
          >
            {isClaiming ? 'Claiming...' : 'Claim'}
          </Button>
        </div>
        <div className="w-[70%] mx-auto mt-4">
          <ProgressSteps progress={progress} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
