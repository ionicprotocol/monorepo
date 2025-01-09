import React from 'react';

import { Loader2, Sparkles } from 'lucide-react';
import { useAccount, useWalletClient } from 'wagmi';

import { AssetIcons } from '@ui/components/AssetIcons';
import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';
import { useMorphoRewards } from '@ui/hooks/earn/useMorphoRewards';
import { useToast } from '@ui/hooks/use-toast';

interface MorphoRewardsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function MorphoRewardsDialog({
  isOpen,
  setIsOpen
}: MorphoRewardsDialogProps) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { rewards, isLoading, totalUsdValue, canClaim } =
    useMorphoRewards(address);
  const [isClaimLoading, setIsClaimLoading] = React.useState(false);
  const { toast } = useToast();

  const handleClaimAll = async () => {
    if (!walletClient || !address || isClaimLoading) return;

    setIsClaimLoading(true);
    try {
      for (const reward of Object.values(rewards)) {
        await walletClient.sendTransaction({
          account: address,
          to: reward.distributorAddress,
          data: reward.txData as `0x${string}`
        });
      }

      toast({
        title: 'Success!',
        description: 'Successfully claimed all rewards',
        duration: 5000
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim rewards. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsClaimLoading(false);
    }
  };

  const RewardRow = ({
    token,
    amount,
    usdValue
  }: {
    token: string;
    amount: string;
    usdValue: number;
  }) => (
    <div className="group flex items-center justify-between py-4 px-2 rounded-lg hover:bg-zinc-800/30 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div className="relative">
          <AssetIcons
            rewards={[token]}
            size={36}
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-tight">
            {amount} {token}
          </span>
          <span className="text-sm text-emerald-500">
            ${usdValue.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Sparkles className="w-4 h-4 text-emerald-500" />
      </div>
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-zinc-900 to-zinc-950 border-zinc-800/50 shadow-xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
              Claim Rewards
            </DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400">
            Your earned MORPHO and ION rewards are ready to be claimed
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          </div>
        ) : Object.keys(rewards).length > 0 ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl p-4">
              <div className="space-y-1">
                {Object.entries(rewards).map(([token, reward]) => (
                  <React.Fragment key={token}>
                    <RewardRow
                      token={token}
                      amount={reward.amount}
                      usdValue={reward.usdValue}
                    />
                    {token !==
                      Object.keys(rewards)[Object.keys(rewards).length - 1] && (
                      <Separator className="bg-zinc-800/50" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <Separator className="my-4 bg-zinc-800/50" />

              <div className="flex justify-between items-center px-2">
                <span className="text-sm text-zinc-400 font-medium">
                  Total Value
                </span>
                <span className="text-lg font-semibold bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                  ${totalUsdValue.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              className="w-full font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all duration-200 shadow-lg shadow-emerald-500/20 border-0"
              size="lg"
              disabled={!canClaim || isClaimLoading}
              onClick={handleClaimAll}
            >
              {isClaimLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {isClaimLoading ? 'Claiming...' : 'Claim All Rewards'}
            </Button>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-zinc-500" />
              </div>
              <span className="text-zinc-400">
                No rewards available to claim
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ClaimRewardsButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { address } = useAccount();
  const { canClaim, isLoading } = useMorphoRewards(address);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={isLoading || !canClaim}
        variant="outline"
        size="sm"
        className="bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-500 transition-all duration-200"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Sparkles className="h-4 w-4 mr-2" />
        )}
        Claim Rewards
      </Button>
      <MorphoRewardsDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
}
