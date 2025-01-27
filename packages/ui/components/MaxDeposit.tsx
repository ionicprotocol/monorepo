import {
  useState,
  useMemo,
  useRef,
  type SetStateAction,
  type Dispatch
} from 'react';

import dynamic from 'next/dynamic';

import { formatUnits, parseUnits, type Address } from 'viem';
import { useAccount, useBalance, useReadContract } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Card, CardContent } from '@ui/components/ui/card';
import { Slider } from '@ui/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@ui/components/ui/tooltip';
import { cn } from '@ui/lib/utils';

import AmountInput from './AmountInput';
import TokenSelector from './stake/TokenSelector';
import TokenDisplay from './TokenDisplay';

import { icErc20Abi } from '@ionicprotocol/sdk';

export interface IBal {
  decimals: number;
  value: bigint;
}

interface IMaxDeposit {
  amount?: string;
  tokenName?: string;
  token?: Address;
  handleInput?: (val?: string) => void;
  headerText?: string;
  max?: string;
  effectiveMax?: string;
  chain: number;
  tokenSelector?: boolean;
  tokenArr?: string[];
  setMaxTokenForUtilization?: Dispatch<SetStateAction<IBal>>;
  useUnderlyingBalance?: boolean;
  footerText?: string;
  decimals?: number;
  readonly?: boolean;
  isLoading?: boolean;
  showUtilizationSlider?: boolean;
  hintText?: string;
}

function MaxDeposit({
  headerText = 'Deposit',
  amount,
  tokenName = 'eth',
  token,
  handleInput,
  max,
  effectiveMax,
  chain,
  tokenSelector = false,
  tokenArr,
  useUnderlyingBalance = false,
  footerText,
  decimals: propDecimals,
  readonly,
  isLoading,
  showUtilizationSlider = false,
  hintText = 'Balance'
}: IMaxDeposit) {
  const { address } = useAccount();
  const [open, setOpen] = useState<boolean>(false);
  const newRef = useRef<HTMLDivElement>(null);

  const hooktoken =
    token === '0x0000000000000000000000000000000000000000' ? undefined : token;

  const { data: regularBalance } = useBalance({
    address,
    token: hooktoken,
    chainId: chain,
    query: {
      enabled: !useUnderlyingBalance,
      refetchInterval: 5000
    }
  });

  // For underlying token balance
  const { data: underlyingBalance } = useReadContract({
    abi: icErc20Abi,
    address: token,
    functionName: 'balanceOfUnderlying',
    args: [address!],
    query: {
      enabled: useUnderlyingBalance && !!address,
      refetchInterval: 5000
    }
  });

  // Use effectiveMax for slider if provided, otherwise fall back to max
  const sliderMax = effectiveMax || max;

  const maxValue = useMemo(() => {
    if (effectiveMax) return effectiveMax;
    if (max) return max;

    const decimals = propDecimals ?? regularBalance?.decimals ?? 18;

    if (useUnderlyingBalance && underlyingBalance) {
      return formatUnits(underlyingBalance, decimals);
    }

    if (!useUnderlyingBalance && regularBalance) {
      return formatUnits(regularBalance.value, decimals);
    }

    return '0';
  }, [
    effectiveMax,
    max,
    regularBalance,
    underlyingBalance,
    useUnderlyingBalance,
    propDecimals
  ]);

  function handleUtilizationChange(value: number[]) {
    if (!maxValue || !handleInput) return;

    const percentage = value[0];

    try {
      const calculatedAmount = (Number(sliderMax) * percentage) / 100;

      let formattedAmount: string;
      if (calculatedAmount < 0.00001) {
        formattedAmount = calculatedAmount.toFixed(18);
      } else {
        formattedAmount = calculatedAmount.toFixed(4);
      }

      formattedAmount = formattedAmount.replace(/\.?0+$/, '');

      if (isNaN(Number(formattedAmount))) {
        console.error('Invalid amount calculated');
        return;
      }

      handleInput(formattedAmount);
    } catch (error) {
      console.error('Error in utilization calculation:', error);
    }
  }

  const bal = useMemo(() => {
    const decimals = propDecimals ?? regularBalance?.decimals ?? 18;

    if (max) {
      const value = parseUnits(max, decimals);
      return { value, decimals };
    } else if (max === '0') {
      return { value: BigInt(0), decimals };
    } else if (useUnderlyingBalance) {
      const value = underlyingBalance ?? BigInt(0);
      return { value, decimals };
    } else if (!useUnderlyingBalance && regularBalance) {
      return {
        value: regularBalance.value,
        decimals: regularBalance.decimals
      };
    }
    return null;
  }, [
    max,
    regularBalance,
    underlyingBalance,
    useUnderlyingBalance,
    propDecimals
  ]);

  function handleMax() {
    if (!handleInput) return;
    handleInput(maxValue);
  }

  const displayPercentage = useMemo(() => {
    if (!amount || !max || Number(max) === 0) return 0;
    return (Number(amount) / Number(max)) * 100;
  }, [amount, max]);

  const formatBalanceForDisplay = (value: bigint, decimals: number): string => {
    const formatted = formatUnits(value, decimals);
    const number = Number(formatted);

    if (number === 0) return '0';

    if (number < 0.00001) {
      return formatted;
    }

    return number.toLocaleString('en-US', {
      maximumFractionDigits: 4,
      minimumFractionDigits: 2
    });
  };
  const formattedBalance = bal
    ? formatBalanceForDisplay(bal.value, bal.decimals)
    : max ?? '0';

  const isMaxDisabled = !maxValue || maxValue === '0';

  const balanceMax = useMemo(() => {
    if (!bal) return '0';
    return formatUnits(bal.value, bal.decimals);
  }, [bal]);

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardContent className="p-0">
        <div className="w-full">
          {/* Mobile Layout */}
          <div className="flex md:hidden flex-col w-full gap-4">
            <div className="flex justify-between items-end w-full">
              <AmountInput
                headerText={headerText}
                handleInput={handleInput}
                readonly={readonly}
                amount={amount}
                max={effectiveMax || max || balanceMax}
                isLoading={isLoading}
              />
              <div className="flex flex-col items-end gap-1">
                <Button
                  variant="ghost"
                  className={cn(
                    'text-white/50 hover:text-white h-4 text-[12px] hover:bg-transparent px-0 font-light',
                    isMaxDisabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={handleMax}
                  disabled={isMaxDisabled}
                >
                  {hintText}: {formattedBalance}
                </Button>
                {tokenSelector ? (
                  <TokenSelector
                    newRef={newRef}
                    open={open}
                    setOpen={setOpen}
                    tokenArr={tokenArr}
                    selectedToken={tokenName}
                  />
                ) : (
                  <TokenDisplay
                    tokens={tokenName?.split('/') ?? ['eth']}
                    tokenName={tokenName}
                  />
                )}
              </div>
            </div>

            {showUtilizationSlider && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'w-full',
                        (!sliderMax || sliderMax === '0') &&
                          'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Slider
                        value={[displayPercentage]}
                        step={1}
                        min={0}
                        max={100}
                        onValueChange={
                          readonly ? undefined : handleUtilizationChange
                        }
                        disabled={!sliderMax || sliderMax === '0' || readonly}
                        className="w-full"
                      />
                    </div>
                  </TooltipTrigger>
                  {(!sliderMax || sliderMax === '0') && (
                    <TooltipContent>
                      <p>No balance available</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center gap-8">
            <AmountInput
              headerText={headerText}
              handleInput={handleInput}
              readonly={readonly}
              amount={amount}
              max={effectiveMax || max || balanceMax}
              isLoading={isLoading}
            />

            {showUtilizationSlider && (
              <div className="flex-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'w-full',
                          (!sliderMax || sliderMax === '0') &&
                            'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Slider
                          value={[displayPercentage]}
                          step={1}
                          min={0}
                          max={100}
                          onValueChange={
                            readonly ? undefined : handleUtilizationChange
                          }
                          disabled={!sliderMax || sliderMax === '0' || readonly}
                          className="w-full"
                        />
                      </div>
                    </TooltipTrigger>
                    {(!sliderMax || sliderMax === '0') && (
                      <TooltipContent>
                        <p>No balance available</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {!showUtilizationSlider && <div className="flex-1" />}

            <div className="flex flex-col items-end gap-1">
              <Button
                variant="ghost"
                size="xs"
                className={cn(
                  'text-white/50 hover:text-white h-4 text-[12px] hover:bg-transparent px-0 font-light',
                  isMaxDisabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={handleMax}
                disabled={isMaxDisabled}
              >
                {hintText}: {formattedBalance}
              </Button>
              {tokenSelector ? (
                <TokenSelector
                  newRef={newRef}
                  open={open}
                  setOpen={setOpen}
                  tokenArr={tokenArr}
                  selectedToken={tokenName}
                />
              ) : (
                <TokenDisplay
                  tokens={tokenName?.split('/') ?? ['eth']}
                  tokenName={tokenName}
                />
              )}
            </div>
          </div>
        </div>
        {footerText && (
          <div className="flex w-full mt-2 items-center justify-between text-[11px] text-white/40">
            <span>{footerText}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default dynamic(() => Promise.resolve(MaxDeposit), { ssr: false });
