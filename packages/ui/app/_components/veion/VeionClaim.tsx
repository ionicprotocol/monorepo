'use client';

import { useState } from 'react';

import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';

import ProgressSteps from '../xION/ProgressSteps';

interface VeionClaimProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VeionClaim({ isOpen, onOpenChange }: VeionClaimProps) {
  const { isConnected } = useAccount();
  const [progress, setProgress] = useState<number>(0);

  async function approval(amount: bigint) {
    try {
      if (!isConnected) {
        console.warn('Wallet not connected');
        return;
      }
      if (amount <= BigInt(0)) return;
      setProgress(1);

      // Approval logic goes here
      console.warn(`Approval hash --> ${amount}`);
      setProgress(2);
    } catch (err) {
      console.warn(err);
      setProgress(0);
    }
  }

  async function claimLp() {
    try {
      if (!isConnected) {
        console.warn('Wallet not connected');
        return;
      }
      const args = {
        tokenAddress: '0xabced'
      };
      // eslint-disable-next-line no-console
      console.log(args);
    } catch (err) {
      console.warn(err);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
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
          Return veION #0012 and receive 15.003 LP
        </p>

        <div className="w-full flex justify-between items-center mb-2 mt-4 gap-2">
          <Button
            onClick={() => approval(BigInt(100))} // Replace with actual amount
            className="w-full bg-accent text-black"
          >
            Approve
          </Button>
          <Button
            onClick={claimLp}
            className="w-full bg-accent text-black"
          >
            Claim
          </Button>
        </div>
        <div className="w-[70%] mx-auto mt-4">
          <ProgressSteps progress={progress} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
