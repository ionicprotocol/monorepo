import React, { useState } from 'react';

import { useChainId, useSwitchChain } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { getChainName } from '@ui/constants/mock';
import { cn } from '@ui/lib/utils';
import type { ChainId } from '@ui/types/veION';

import ResultHandler from './ResultHandler';

export type TransactionResult = {
  success?: boolean;
  needsApproval?: boolean;
};

type TransactionButtonProps = {
  onSubmit: () => Promise<TransactionResult>;
  onContinue?: () => void;
  isDisabled: boolean;
  buttonText?: string;
  targetChainId?: number;
  variant?: 'accent' | 'default' | 'green';
};

const variantStyles = {
  default:
    'bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70',
  accent:
    'bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70',
  green:
    'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600'
};

const TransactionButton: React.FC<TransactionButtonProps> = ({
  onSubmit,
  onContinue,
  isDisabled,
  buttonText = 'Submit',
  targetChainId,
  variant = 'default'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = targetChainId && targetChainId !== currentChainId;

  const handleTransaction = async () => {
    if (showContinue && onContinue) {
      onContinue();
      setShowContinue(false);
      return;
    }

    try {
      if (isWrongNetwork && targetChainId) {
        await switchChain({ chainId: targetChainId });
        return;
      }

      setIsLoading(true);
      const result = await onSubmit();

      if (result.success) {
        if (onContinue) {
          setShowContinue(true);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isWrongNetwork) {
      return `Switch to ${getChainName(targetChainId as ChainId)}`;
    }

    if (showContinue) {
      return 'Continue';
    }

    if (!isLoading) {
      return buttonText;
    }

    return (
      <div className="flex items-center justify-center gap-2">
        <ResultHandler
          isLoading={true}
          width="20"
          height="20"
          color="#000"
        >
          <span>{buttonText}</span>
        </ResultHandler>
        <span className="text-sm font-medium">{buttonText}</span>
      </div>
    );
  };

  return (
    <Button
      className={cn(
        'w-full text-black relative min-h-[48px] text-base font-semibold py-4',
        'transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
        variantStyles[variant],
        (isDisabled && !showContinue) || (isLoading && !isWrongNetwork)
          ? 'opacity-50 cursor-not-allowed'
          : ''
      )}
      onClick={handleTransaction}
      disabled={(isDisabled && !showContinue) || (isLoading && !isWrongNetwork)}
    >
      {getButtonContent()}
    </Button>
  );
};

export default TransactionButton;
