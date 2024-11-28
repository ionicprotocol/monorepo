import {
  useState,
  useMemo,
  useRef,
  type SetStateAction,
  type Dispatch
} from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { formatUnits, parseUnits, type Address } from 'viem';
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
  amount?: string;
  tokenName?: string;
  token?: Address;
  handleInput?: (val?: string) => void;
  fetchOwn?: boolean;
  headerText?: string;
  max?: string;
  chain: number;
  tokenSelector?: boolean;
  tokenArr?: string[];
  setMaxTokenForUtilization?: Dispatch<SetStateAction<IBal>>;
  useUnderlyingBalance?: boolean;
  footerText?: string;
  decimals?: number;
}

function MaxDeposit({
  headerText = 'Deposit',
  amount,
  tokenName = 'eth',
  token,
  handleInput,
  fetchOwn = false,
  max,
  chain,
  tokenSelector = false,
  tokenArr,
  setMaxTokenForUtilization,
  useUnderlyingBalance = false,
  footerText,
  decimals: propDecimals
}: IMaxDeposit) {
  const [bal, setBal] = useState<IBal>();
  const { address } = useAccount();

  // For regular token balance
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

  function handlInpData(e: React.ChangeEvent<HTMLInputElement>) {
    if (
      bal &&
      Number(e.target.value) > Number(formatUnits(bal.value, bal.decimals))
    )
      return;
    if (!handleInput) return;
    handleInput(e.target.value);
  }

  function handleMax() {
    if (!handleInput || !bal) return;
    const maxValue = formatUnits(bal.value, bal.decimals);
    handleInput(maxValue);
    setMaxTokenForUtilization?.({
      value: bal.value,
      decimals: bal.decimals
    });
  }

  const newRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);

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
              : max ?? '0'}
            {handleInput && (
              <Button
                variant="ghost"
                size="xs"
                className="text-accent h-4 text-[10px] hover:bg-transparent pr-0"
                onClick={handleMax}
              >
                MAX
              </Button>
            )}
          </div>
        </div>
        <div className="flex max-w-full items-center gap-x-4">
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
          <div className="flex-none flex items-center">
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
