import { useState, useEffect } from 'react';

import { formatEther } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import MaxDeposit from '@ui/components/MaxDeposit';
import TransactionButton from '@ui/components/TransactionButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { StakingContractAbi } from '@ui/constants/staking';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONActions } from '@ui/hooks/veion/useVeIONActions';
import {
  getStakingToContract,
  getAvailableStakingToken
} from '@ui/utils/getStakingTokens';

interface UnstakeIonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedToken: 'eth' | 'mode' | 'weth';
}

export default function UnstakeIonDialog({
  isOpen,
  onOpenChange,
  selectedToken
}: UnstakeIonDialogProps) {
  const { isConnected, address, chainId } = useAccount();
  const [amount, setAmount] = useState<string>('');

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

  useEffect(() => {
    setAmount('');
  }, [currentChain]);

  const handleMigrate = async () => {
    try {
      if (!isConnected) {
        console.warn('Wallet not connected');
        return {
          success: false
        };
      }

      await removeLiquidity({
        liquidity: amount,
        selectedToken
      });

      allStakedAmount.refetch();

      setAmount('');
      return {
        success: true
      };
    } catch (err) {
      console.warn(err);
      return {
        success: false
      };
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

          <TransactionButton
            onSubmit={handleMigrate}
            isDisabled={!isConnected || !amount || Number(amount) === 0}
            buttonText="Unstake LP"
            targetChainId={currentChain}
            onContinue={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
