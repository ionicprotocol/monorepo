import React, { useState } from 'react';

import Image from 'next/image';

import { Info } from 'lucide-react';

import TransactionButton from '@ui/components/TransactionButton';
import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { ScrollArea } from '@ui/components/ui/scroll-area';
import { useVeIONContext } from '@ui/context/VeIonContext';
import {
  convertToContractWeight,
  useVeIONVote
} from '@ui/hooks/veion/useVeIONVote';
import { MarketSide } from '@ui/types/veION';

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
  votes: VoteRecord;
  tokenId: number;
}

const VoteConfirmationDialog: React.FC<VoteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  votes,
  tokenId
}) => {
  const { currentChain, selectedManagePosition } = useVeIONContext();
  const { handleVote, isVoting } = useVeIONVote(currentChain);
  const voteEntries = Object.entries(votes);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const voteArrays = Object.entries(votes).reduce(
        (acc, [_, vote]) => {
          acc.marketAddresses.push(vote.marketAddress);
          acc.sides.push(vote.side);
          acc.weights.push(BigInt(convertToContractWeight(vote.voteValue)));
          return acc;
        },
        {
          marketAddresses: [] as `0x${string}`[],
          sides: [] as MarketSide[],
          weights: [] as bigint[]
        }
      );

      const success = await handleVote(tokenId, {
        marketAddresses: voteArrays.marketAddresses,
        sides: voteArrays.sides,
        weights: voteArrays.weights
      });

      if (success) {
        onClose();
      }
      return { success };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit votes');
      return { success: false };
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isVoting && !open) {
          onClose();
          setError(null);
        }
      }}
    >
      <DialogContent className="max-w-2xl h-screen max-h-screen sm:max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Confirm Your Votes</DialogTitle>
          <DialogDescription>
            Please review your voting selections before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-none p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-white/60">Position ID</span>
              <span className="text-sm font-medium">
                #{selectedManagePosition?.id}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-white/60">Tokens Locked</span>
              <span className="text-sm font-medium">
                {selectedManagePosition?.lockedBLP.amount} BLP
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-white/60">Value Locked</span>
              <span className="text-sm font-medium">
                $
                {selectedManagePosition?.lockedBLP.value.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 7
                  }
                )}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-white/60">Voting Power</span>
              <span className="text-sm font-medium">
                {selectedManagePosition?.votingPower.toFixed(5)} veION
              </span>
            </div>
          </div>
        </div>

        <div className="flex-none flex gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
          <div className="space-y-2 text-sm text-blue-100">
            <p>• Votes count once per epoch</p>
            <p>• You can&apos;t recast votes within the same epoch</p>
            <p>• You can&apos;t modify your position until the next epoch</p>
            <p>• Voting rewards will be available in the next epoch</p>
          </div>
        </div>

        {error && (
          <div className="flex-none text-sm text-red-500 mt-2">{error}</div>
        )}

        <ScrollArea className="flex-1 min-h-0 rounded-md border border-white/10">
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

        <DialogFooter className="flex-none mt-4 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isVoting}
            className="hover:bg-gray-900"
          >
            Cancel
          </Button>
          <TransactionButton
            onSubmit={handleSubmit}
            isDisabled={isVoting}
            buttonText="Confirm Votes"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VoteConfirmationDialog;
