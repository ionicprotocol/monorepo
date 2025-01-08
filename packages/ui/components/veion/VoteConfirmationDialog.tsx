import React from 'react';
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
import { Check, X } from 'lucide-react';
import { MarketSide } from '@ui/hooks/veion/useVeIONVote';

type VoteRecord = Record<
  string,
  {
    marketAddress: `0x${string}`;
    side: MarketSide;
    voteValue: string;
    autoVote: boolean;
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
      onOpenChange={onClose}
    >
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Your Votes</AlertDialogTitle>
          <AlertDialogDescription>
            Please review your voting selections before confirming.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="h-96 rounded-md border border-white/10 my-4">
          <div className="p-4">
            <div className="space-y-4">
              {voteEntries.map(([key, vote]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
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
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        Auto Vote:
                        {vote.autoVote ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isVoting}>Cancel</AlertDialogCancel>
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
