import { useState, useEffect } from 'react';

import { formatEther } from 'viem';
import { useAccount, useSwitchChain, useReadContract } from 'wagmi';

import MaxDeposit from '@ui/components/MaxDeposit';
import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { getChainName } from '@ui/constants/mock';
import { StakingContractAbi } from '@ui/constants/staking';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONActions } from '@ui/hooks/veion/useVeIONActions';
import type { ChainId } from '@ui/types/veION';
import {
  getStakingToContract,
  getAvailableStakingToken
} from '@ui/utils/getStakingTokens';

interface MigrateIonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedToken: 'eth' | 'mode' | 'weth';
}

export default function MigrateIonDialog({
  isOpen,
  onOpenChange,
  selectedToken
}: MigrateIonDialogProps) {
  const { isConnected, address, chainId } = useAccount();
  const [amount, setAmount] = useState<string>('');
  const { switchChain } = useSwitchChain();

  const { currentChain } = useVeIONContext();
  const { removeLiquidity, isPending } = useVeIONActions();

  const stakingContractAddress = getStakingToContract(
    currentChain,
    selectedToken
  );
  const stakingTokenAddress = getAvailableStakingToken(
    currentChain,
    selectedToken
  );

  const allStakedAmount = useReadContract({
    abi: StakingContractAbi,
    address: stakingContractAddress,
    args: [address as `0x${string}`],
    functionName: 'balanceOf',
    chainId: currentChain,
    query: {
      enabled: true,
      notifyOnChangeProps: ['data', 'error'],
      placeholderData: 0n
    }
  });

  // Reset amount when chain changes
  useEffect(() => {
    setAmount('');
  }, [currentChain]);

  const switchToCorrectChain = async ({ chainId }: { chainId: number }) => {
    try {
      await switchChain({ chainId });
    } catch (switchError) {
      console.error('Failed to switch network:', switchError);
    }
  };

  const handleMigrate = async () => {
    try {
      if (!isConnected) {
        console.warn('Wallet not connected');
        return;
      }

      await removeLiquidity({
        liquidity: amount,
        selectedToken
      });

      allStakedAmount.refetch();

      setAmount('');
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-grayUnselect w-full max-w-[480px]">
        <DialogHeader className="flex flex-row items-center">
          <DialogTitle>Migrate ION Liquidity</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <MaxDeposit
            amount={amount}
            handleInput={(val?: string) => setAmount(val || '')}
            tokenName={`ion/${selectedToken}`}
            token={stakingTokenAddress}
            chain={currentChain}
            max={
              allStakedAmount.data
                ? formatEther(allStakedAmount.data as bigint)
                : '0'
            }
            headerText="Available LP"
            showUtilizationSlider
          />

          {chainId !== currentChain ? (
            <Button
              onClick={() => switchToCorrectChain({ chainId: currentChain })}
              className="w-full bg-accent text-black"
            >
              Switch to {getChainName(currentChain as ChainId)}
            </Button>
          ) : (
            <Button
              onClick={handleMigrate}
              className="w-full bg-red-500 text-white hover:bg-red-600"
              disabled={!amount || Number(amount) === 0 || isPending}
            >
              {isPending ? 'Migrating...' : 'Migrate Liquidity'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
