// components/SupplySteps.tsx
import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { Button } from '@ui/components/ui/button';
import { useMediaQuery } from '@ui/hooks/useMediaQuery';

interface SupplyStepsProps {
  symbol: string;
  isApproving: boolean;
  isSupplying: boolean;
  isWaitingForIndexing: boolean;
  onApprove: () => void;
  onSupply: () => void;
  disabled: boolean;
}

// Desktop version - horizontal layout
function SupplyStepsDesktop({
  symbol,
  isApproving,
  isSupplying,
  isWaitingForIndexing,
  onApprove,
  onSupply,
  disabled
}: SupplyStepsProps) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (isApproving || isSupplying) {
      setCurrentStep(isApproving ? 1 : 2);
    }
  }, [isApproving, isSupplying]);

  return (
    <div className="flex flex-col gap-4">
      {/* Action buttons in one row */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onApprove}
          disabled={disabled || isApproving || currentStep > 1}
          className="bg-accent hover:bg-accent/90 text-black"
        >
          {isApproving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Approving...
            </>
          ) : (
            `Approve ${symbol}`
          )}
        </Button>
        <Button
          onClick={onSupply}
          disabled={
            disabled || isSupplying || currentStep === 1 || isWaitingForIndexing
          }
          variant={currentStep === 2 && !disabled ? 'default' : 'secondary'}
          className={currentStep === 2 && !disabled ? '' : 'opacity-50'}
        >
          {isWaitingForIndexing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : isSupplying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Supplying...
            </>
          ) : (
            `Supply ${symbol}`
          )}
        </Button>
      </div>

      {/* Step indicators with connecting line */}
      <div className="relative flex items-center justify-between w-[70%] self-center">
        {/* Background line */}
        <div className="absolute left-0 right-0 h-0.5 bg-gray-600" />

        {/* Progress line */}
        <div
          className="absolute left-0 h-0.5 bg-accent transition-all duration-300"
          style={{
            width: currentStep === 1 ? '0%' : '100%'
          }}
        />

        {/* Step indicators */}
        <div
          className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
            currentStep >= 1
              ? 'bg-accent text-black'
              : 'bg-gray-600 text-gray-400'
          }`}
        >
          1
        </div>
        <div
          className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
            currentStep >= 2
              ? 'bg-accent text-black'
              : 'bg-gray-600 text-gray-400'
          }`}
        >
          2
        </div>
      </div>
    </div>
  );
}

function SupplyStepsMobile({
  symbol,
  isApproving,
  isSupplying,
  isWaitingForIndexing,
  onApprove,
  onSupply,
  disabled
}: SupplyStepsProps) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (isApproving || isSupplying) {
      setCurrentStep(isApproving ? 1 : 2);
    }
  }, [isApproving, isSupplying]);

  return (
    <div className="flex gap-4 w-full">
      {/* Steps column */}
      <div className="flex flex-col items-center">
        {/* Step 1 */}
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
            currentStep >= 1
              ? 'bg-accent text-black'
              : 'bg-gray-600 text-gray-400'
          }`}
        >
          1
        </div>

        {/* Vertical connecting line - reduced height and margin */}
        <div className="relative w-0.5 h-6 bg-gray-600">
          <div
            className="absolute top-0 w-0.5 bg-accent transition-all duration-300"
            style={{
              height: currentStep === 1 ? '0%' : '100%'
            }}
          />
        </div>

        {/* Step 2 */}
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
            currentStep >= 2
              ? 'bg-accent text-black'
              : 'bg-gray-600 text-gray-400'
          }`}
        >
          2
        </div>
      </div>

      {/* Buttons column */}
      <div className="flex-1 flex flex-col gap-2">
        <Button
          onClick={onApprove}
          disabled={disabled || isApproving || currentStep > 1}
          className="bg-accent hover:bg-accent/90 text-black"
        >
          {isApproving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Approving...
            </>
          ) : (
            `Approve ${symbol}`
          )}
        </Button>

        <Button
          onClick={onSupply}
          disabled={
            disabled || isSupplying || currentStep === 1 || isWaitingForIndexing
          }
          variant={currentStep === 2 && !disabled ? 'default' : 'secondary'}
          className={currentStep === 2 && !disabled ? '' : 'opacity-50'}
        >
          {isWaitingForIndexing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : isSupplying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Supplying...
            </>
          ) : (
            `Supply ${symbol}`
          )}
        </Button>
      </div>
    </div>
  );
}

export function SupplySteps(props: SupplyStepsProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? (
    <SupplyStepsMobile {...props} />
  ) : (
    <SupplyStepsDesktop {...props} />
  );
}
