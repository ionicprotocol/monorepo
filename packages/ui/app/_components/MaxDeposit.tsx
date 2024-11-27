import {
  useState,
  useEffect,
  useRef,
  type SetStateAction,
  type Dispatch
} from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { formatUnits, type Address } from 'viem';
import { useAccount, useBalance, useReadContract } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Card, CardContent } from '@ui/components/ui/card';
import { Input } from '@ui/components/ui/input';

import TokenSelector from './stake/TokenSelector';

import { icErc20Abi } from '@ionicprotocol/sdk';

export interface IBal {
  decimals: number;
  value: bigint;
}

interface IMaxDeposit {
  amount: string;
  tokenName: string;
  token?: Address;
  handleInput?: (val?: string) => void;
  fetchOwn?: boolean;
  headerText?: string;
  chain: number;
  tokenSelector?: boolean;
  tokenArr?: string[];
  setMaxTokenForUtilization?: Dispatch<SetStateAction<IBal>>;
  // Optional props for dashboard-specific features
  useUnderlyingBalance?: boolean; // Flag to determine which balance to use
  footerText?: string;
  decimals?: number;
}

function MaxDeposit({
  headerText,
  amount,
  tokenName,
  token,
  handleInput,
  fetchOwn = false,
  chain,
  tokenSelector = false,
  tokenArr,
  setMaxTokenForUtilization,
  useUnderlyingBalance = false, // Default to regular balance
  footerText,
  decimals: propDecimals
}: IMaxDeposit) {
  const [bal, setBal] = useState<IBal>();
  const { address } = useAccount();

  // Use either underlying balance or regular balance based on flag
  const { data: regularBalance } = useBalance({
    address,
    token,
    chainId: chain,
    query: {
      enabled: !useUnderlyingBalance,
      refetchInterval: 5000
    }
  });

  const { data: underlyingBalance } = useReadContract({
    abi: icErc20Abi,
    address: token,
    functionName: 'balanceOfUnderlying',
    args: [address!],
    query: {
      enabled: useUnderlyingBalance,
      refetchInterval: 5000
    }
  });

  // Determine which balance and decimals to use
  const balance = useUnderlyingBalance
    ? underlyingBalance ?? 0n
    : regularBalance?.value ?? 0n;
  const decimals = propDecimals ?? regularBalance?.decimals ?? 18;

  useEffect(() => {
    if (balance) {
      setBal({ value: balance, decimals });
      setMaxTokenForUtilization?.({
        value: balance,
        decimals
      });
    }
  }, [balance, decimals, setMaxTokenForUtilization]);

  function handlInpData(e: React.ChangeEvent<HTMLInputElement>) {
    if (
      bal &&
      Number(e.target.value) > Number(formatUnits(bal.value, bal.decimals))
    )
      return;
    handleInput?.(e.target.value);
  }

  function handleMax(val?: string) {
    if (!handleInput || !val) return;
    handleInput(val);
  }

  const newRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (newRef.current && !newRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Split tokenName if it contains multiple tokens
  const tokens = tokenName?.split('/') ?? ['eth'];

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardContent className="p-0">
        <div
          className={`flex w-full mt-2 items-center justify-between text-[11px] text-white/40 ${
            !fetchOwn ? 'flex' : 'hidden'
          }`}
        >
          <span>{headerText}</span>
          <div>
            {tokenName?.toUpperCase() ?? ''} Balance:{' '}
            {bal
              ? parseFloat(formatUnits(bal.value, bal.decimals)).toLocaleString(
                  'en-US',
                  {
                    maximumFractionDigits: 3
                  }
                )
              : '0'}
            {handleInput && (
              <Button
                variant="ghost"
                size="sm"
                className="text-accent ml-2 h-6 px-2"
                onClick={() => {
                  handleMax(bal ? formatUnits(bal.value, bal.decimals) : '0');
                }}
              >
                MAX
              </Button>
            )}
          </div>
        </div>
        <div className="flex max-w-full mt-2 items-center gap-x-4">
          <Input
            className="focus:outline-none amount-field font-bold bg-transparent disabled:text-white/60 flex-1 min-w-0 border-0 p-0"
            placeholder="0.0"
            type="number"
            value={
              fetchOwn
                ? bal &&
                  parseFloat(
                    formatUnits(bal.value, bal.decimals)
                  ).toLocaleString('en-US', {
                    maximumFractionDigits: 3
                  })
                : amount
            }
            onChange={handlInpData}
            disabled={!handleInput}
          />
          <div className="flex-none flex items-center justify-end">
            {tokenSelector ? (
              <TokenSelector
                newRef={newRef}
                open={open}
                setOpen={setOpen}
                tokenArr={tokenArr}
                selectedToken={tokenName}
              />
            ) : (
              <div className="flex items-center">
                <div className="relative flex items-center">
                  {tokens.map((token, index) => (
                    <div
                      key={token}
                      className="relative"
                      style={{
                        marginLeft: index > 0 ? '-0.5rem' : '0',
                        zIndex: tokens.length - index
                      }}
                    >
                      <Image
                        src={`/img/symbols/32/color/${token.toLowerCase()}.png`}
                        alt={`${token} logo`}
                        width={18}
                        height={18}
                        className="rounded-full border border-black bg-black"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/img/logo/ION.png';
                        }}
                      />
                    </div>
                  ))}
                </div>
                <span className="ml-2">{tokenName?.toUpperCase()}</span>
              </div>
            )}
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
