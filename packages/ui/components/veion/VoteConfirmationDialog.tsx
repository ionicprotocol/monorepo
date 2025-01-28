import React from 'react';

import Image from 'next/image';

import { Info } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@ui/components/ui/alert-dialog';
import { ScrollArea } from '@ui/components/ui/scroll-area';
import { MarketSide } from '@ui/hooks/veion/useVeIONVote';

type VoteRecord = Record<
  string,
  {
    marketAddress: `0x${string}`;
    side: MarketSide;
    voteValue: string;
    asset: string;
  }
>;

interface VoteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  votes: VoteRecord;
  isVoting: boolean;
}

const VoteConfirmationDialog: React.FC<VoteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  votes,
  isVoting
}) => {
  const voteEntries = Object.entries(votes);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isVoting) {
          onClose();
        }
      }}
    >
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Your Votes</AlertDialogTitle>
          <AlertDialogDescription>
            Please review your voting selections before confirming.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Info className="h-4 w-4 text-blue-500" />
          <p className="text-sm text-blue-100">
            Your choices will automatically apply to future epochs unless
            modified
          </p>
        </div>

        <ScrollArea className="h-96 rounded-md border border-white/10">
          <div className="p-4">
            <div className="space-y-4">
              {voteEntries.map(([key, vote]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Image
                        src={`/img/symbols/32/color/${vote.asset.toLowerCase()}.png`}
                        alt={vote.asset}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-sm font-medium text-white/90">
                        {vote.asset}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/60">
                        {vote.side === MarketSide.Supply ? 'Supply' : 'Borrow'}
                      </span>
                    </div>
                    <span className="text-xs text-white/60">
                      {vote.marketAddress.slice(0, 6)}...
                      {vote.marketAddress.slice(-4)}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-medium text-white/90">
                        {vote.voteValue}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isVoting}
            className="hover:bg-gray-900"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault();
              await onConfirm();
            }}
            disabled={isVoting}
            className="bg-accent hover:bg-green-600"
          >
            {isVoting ? (
              <div className="flex items-center gap-2">
                <span className="animate-spin">⟳</span>
                Confirming...
              </div>
            ) : (
              'Confirm Votes'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default VoteConfirmationDialog;
