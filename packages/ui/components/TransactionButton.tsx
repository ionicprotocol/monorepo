import React, { useState } from 'react';

import { useChainId, useSwitchChain } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { getChainName } from '@ui/constants/mock';
import type { ChainId } from '@ui/types/veION';

import ResultHandler from './ResultHandler';

export type TransactionResult = {
  success?: boolean;
  needsApproval?: boolean;
};

type TransactionButtonProps = {
  onSubmit: () => Promise<TransactionResult>;
  isDisabled: boolean;
  buttonText?: string;
  className?: string;
  targetChainId?: number;
};

const TransactionButton: React.FC<TransactionButtonProps> = ({
  onSubmit,
  isDisabled,
  buttonText = 'Submit',
  className = '',
  targetChainId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = targetChainId && targetChainId !== currentChainId;

  const handleTransaction = async () => {
    try {
      // If we're on the wrong network, switch first
      if (isWrongNetwork && targetChainId) {
        await switchChain({ chainId: targetChainId });
        return; // The UI will re-render with the new network, and the button can be clicked again
      }

      setIsLoading(true);
      const result = await onSubmit();

      if (result.success) {
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
      className={`w-full bg-accent text-black relative min-h-[40px] ${className}`}
      onClick={handleTransaction}
      disabled={isDisabled || (isLoading && !isWrongNetwork)}
    >
      {getButtonContent()}
    </Button>
  );
};

export default TransactionButton;
