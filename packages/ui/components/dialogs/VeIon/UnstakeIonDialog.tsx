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
  selectedToken: 'eth' | 'lsk' | 'mode' | 'weth';
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
      <DialogContent className="bg-black bg-opacity-90 border border-white/10 shadow-2xl backdrop-blur-lg w-full max-w-[520px] p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
            Unstake ION Liquidity
          </DialogTitle>
          <p className="text-sm text-white/60">
            Withdraw your staked LP tokens
          </p>
        </DialogHeader>

        <div className="space-y-8 mt-6">
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
