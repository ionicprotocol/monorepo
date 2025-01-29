import React, { useState } from 'react';

import { Button } from '@ui/components/ui/button';

import ResultHandler from './ResultHandler';

type TransactionResult = {
  success?: boolean;
  needsApproval?: boolean;
};

type TransactionButtonProps = {
  onSubmit: () => Promise<TransactionResult>;
  isDisabled: boolean;
  buttonText?: string;
  className?: string;
};

const TransactionButton: React.FC<TransactionButtonProps> = ({
  onSubmit,
  isDisabled,
  buttonText = 'Submit',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTransaction = async () => {
    try {
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
        <span className="ml-2 text-sm font-medium">{buttonText}</span>
      </div>
    );
  };

  return (
    <Button
      className={`w-full bg-accent text-black mt-4 relative min-h-[40px] ${className}`}
      onClick={handleTransaction}
      disabled={isDisabled || isLoading}
    >
      {getButtonContent()}
    </Button>
  );
};

export default TransactionButton;
