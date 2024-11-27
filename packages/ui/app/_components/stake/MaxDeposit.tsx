import {
  useState,
  useMemo,
  useEffect,
  useRef,
  type SetStateAction,
  type Dispatch
} from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { formatUnits, parseUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Card, CardContent } from '@ui/components/ui/card';
import { Input } from '@ui/components/ui/input';

import TokenSelector from './TokenSelector';

export interface IBal {
  decimals: number;
  value: bigint;
}

interface IMaxDeposit {
  amount?: string;
  tokenName?: string;
  token?: `0x${string}`;
  handleInput?: (val?: string) => void;
  fetchOwn?: boolean;
  headerText?: string;
  max?: string;
  chain: number;
  tokenSelector?: boolean;
  tokenArr?: string[];
  setMaxTokenForUtilization?: Dispatch<SetStateAction<IBal>>;
}

function MaxDeposit({
  headerText = 'Deposit',
  amount,
  tokenName = 'eth',
  token,
  handleInput,
  fetchOwn = false,
  max = '',
  chain,
  tokenSelector = false,
  tokenArr,
  setMaxTokenForUtilization
}: IMaxDeposit) {
  const [bal, setBal] = useState<IBal>();

  const { address } = useAccount();
  const hooktoken =
    token === '0x0000000000000000000000000000000000000000' ? undefined : token;

  const { data } = useBalance({
    address,
    token: hooktoken,
    chainId: chain,
    query: {
      refetchInterval: 5000
    }
  });

  useMemo(() => {
    if (max) {
      setBal({
        value: parseUnits(max, data?.decimals ?? 18),
        decimals: data?.decimals ?? 18
      });
    } else if (max === '0') {
      setBal({ value: BigInt(0), decimals: data?.decimals ?? 18 });
    } else {
      data && setBal({ value: data?.value, decimals: data?.decimals });
    }
  }, [data, max]);

  function handlInpData(e: React.ChangeEvent<HTMLInputElement>) {
    if (
      bal &&
      Number(e.target.value) > Number(formatUnits(bal.value, bal.decimals))
    )
      return;
    if (!handleInput) return;
    handleInput(e.target.value);
  }

  function handleMax(val: string) {
    if (!handleInput) return;
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
              : max}
            {handleInput && (
              <Button
                variant="ghost"
                size="xs"
                className="text-accent h-4 text-[10px] hover:bg-transparent pr-0"
                onClick={() => {
                  handleMax(bal ? formatUnits(bal.value, bal.decimals) : max);
                  setMaxTokenForUtilization &&
                    setMaxTokenForUtilization({
                      value: bal?.value ?? BigInt(0),
                      decimals: bal?.decimals ?? 18
                    });
                }}
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
      </CardContent>
    </Card>
  );
}

export default dynamic(() => Promise.resolve(MaxDeposit), { ssr: false });
