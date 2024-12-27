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
  initialUtilization?: number;
  onUtilizationChange?: (percentage: number) => void;
}

function MaxDeposit({
  headerText = 'Deposit',
  amount,
  tokenName = 'eth',
  token,
  handleInput,
  max,
  chain,
  tokenSelector = false,
  tokenArr,
  setMaxTokenForUtilization,
  useUnderlyingBalance = false,
  footerText,
  decimals: propDecimals,
  readonly,
  isLoading,
  showUtilizationSlider = false,
  initialUtilization = 0,
  onUtilizationChange
}: IMaxDeposit) {
  const [bal, setBal] = useState<IBal>();
  const [utilizationPercentage, setUtilizationPercentage] =
    useState(initialUtilization);
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

  useMemo(() => {
    const decimals = propDecimals ?? regularBalance?.decimals ?? 18;

    if (max) {
      const value = parseUnits(max, decimals);
      setBal({ value, decimals });
      setMaxTokenForUtilization?.({ value, decimals });
    } else if (max === '0') {
      setBal({ value: BigInt(0), decimals });
      setMaxTokenForUtilization?.({ value: BigInt(0), decimals });
    } else if (useUnderlyingBalance) {
      const value = underlyingBalance ?? BigInt(0);
      setBal({ value, decimals });
      setMaxTokenForUtilization?.({ value, decimals });
    } else if (!useUnderlyingBalance && regularBalance) {
      setBal({
        value: regularBalance.value,
        decimals: regularBalance.decimals
      });
      setMaxTokenForUtilization?.({
        value: regularBalance.value,
        decimals: regularBalance.decimals
      });
    }
  }, [
    max,
    regularBalance,
    underlyingBalance,
    useUnderlyingBalance,
    propDecimals,
    setMaxTokenForUtilization
  ]);

  function handleMax() {
    if (!handleInput || !bal) return;
    const maxValue = formatUnits(bal.value, bal.decimals);
    handleInput(maxValue);
    setMaxTokenForUtilization?.({
      value: bal.value,
      decimals: bal.decimals
    });
    setUtilizationPercentage(100);
    onUtilizationChange?.(100);
  }

  function handleUtilizationChange(value: number[]) {
    const percentage = value[0];
    setUtilizationPercentage(percentage);

    if (!bal || !handleInput) return;

    const maxValue = Number(formatUnits(bal.value, bal.decimals));
    const newAmount = ((maxValue * percentage) / 100).toString();
    handleInput(newAmount);
    onUtilizationChange?.(percentage);
  }

  const tokens = tokenName?.split('/') ?? ['eth'];
  const formattedBalance = bal
    ? parseFloat(formatUnits(bal.value, bal.decimals)).toLocaleString('en-US', {
        maximumFractionDigits: 3
      })
    : max ?? '0';

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
                max={formattedBalance}
                isLoading={isLoading}
              />
              <div className="flex flex-col items-end gap-1">
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-white/50 hover:text-white h-4 text-[10px] hover:bg-transparent px-0"
                  onClick={handleMax}
                >
                  Balance: {formattedBalance}
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
                    tokens={tokens}
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
                        (!bal || bal.value === BigInt(0)) &&
                          'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Slider
                        value={[utilizationPercentage]}
                        step={1}
                        min={0}
                        max={100}
                        onValueChange={handleUtilizationChange}
                        disabled={!bal || bal.value === BigInt(0)}
                        className="w-full"
                      />
                    </div>
                  </TooltipTrigger>
                  {(!bal || bal.value === BigInt(0)) && (
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
              max={formattedBalance}
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
                          (!bal || bal.value === BigInt(0)) &&
                            'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Slider
                          value={[utilizationPercentage]}
                          step={1}
                          min={0}
                          max={100}
                          onValueChange={handleUtilizationChange}
                          disabled={!bal || bal.value === BigInt(0)}
                          className="w-full"
                        />
                      </div>
                    </TooltipTrigger>
                    {(!bal || bal.value === BigInt(0)) && (
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
                className="text-white/50 hover:text-white h-4 text-[10px] hover:bg-transparent px-0"
                onClick={handleMax}
              >
                Balance: {formattedBalance}
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
                  tokens={tokens}
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
