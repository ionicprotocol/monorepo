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

import TokenSelector from './TokenSelector';
import { PrecisionSlider } from '../PrecisionSlider';

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
  size?: number;
  setMaxTokenForUtilization?: Dispatch<SetStateAction<IBal>>;
  // New props
  useSlider?: boolean;
  pairedToken?: string;
  sliderStep?: number;
}

export interface IBal {
  decimals: number;
  value: bigint;
}

const TokenPair = ({
  token1,
  token2,
  size = 32
}: {
  token1: string;
  token2: string;
  size?: number;
}) => (
  <span className="flex">
    <Image
      src={`/img/logo/${token1.toLowerCase()}.svg`}
      alt={`${token1} logo`}
      width={size}
      height={size}
      className="rounded-full"
      unoptimized
    />
    <Image
      src={`/img/logo/${token2.toLowerCase()}.svg`}
      alt={`${token2} logo`}
      width={size}
      height={size}
      className="rounded-full -ml-2"
      unoptimized
    />
  </span>
);

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
  size = 20,
  setMaxTokenForUtilization,
  useSlider = false,
  pairedToken,
  sliderStep = 1
}: IMaxDeposit) {
  const [bal, setBal] = useState<IBal>();
  const [utilizationPercentage, setUtilizationPercentage] = useState(0);

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
    } else if (max == '0') {
      setBal({ value: BigInt(0), decimals: data?.decimals ?? 18 });
    } else {
      data && setBal({ value: data?.value, decimals: data?.decimals });
    }
  }, [data, max]);

  useEffect(() => {
    if (bal && amount) {
      const percentage =
        (Number(amount) / Number(formatUnits(bal.value, bal.decimals))) * 100;
      setUtilizationPercentage(percentage);
    }
  }, [amount, bal]);

  function handlInpData(e: React.ChangeEvent<HTMLInputElement>) {
    if (
      bal &&
      Number(e.target.value) > Number(formatUnits(bal?.value, bal?.decimals))
    )
      return;
    if (!handleInput) return;
    handleInput(e.target.value);
  }

  function handleMax(val: string) {
    if (!handleInput) return;
    handleInput(val);
  }

  function handleSliderChange(value: number) {
    if (!handleInput || !bal) return;
    const maxValue = Number(formatUnits(bal.value, bal.decimals));
    const newAmount = (value / 100) * maxValue;
    handleInput(newAmount.toString());
  }

  const newRef = useRef(null!);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleOutsideClick = (e: any) => {
    //@ts-ignore
    if (newRef.current && !newRef.current?.contains(e?.target)) {
      setOpen(false);
    }
  };

  const renderTokenDisplay = () => {
    if (pairedToken) {
      return (
        <TokenPair
          token1={tokenName}
          token2={pairedToken}
          size={size}
        />
      );
    }
    return (
      <>
        <Image
          alt="token logo"
          className={`w-5 h-5 inline-block ml-2`}
          src={`/img/symbols/32/color/${tokenName.toLowerCase()}.png`}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = '/img/logo/ion.svg';
          }}
          width={size}
          height={size}
          unoptimized
        />
        <button className={`ml-2`}>{tokenName.toUpperCase()}</button>
      </>
    );
  };

  return (
    <div>
      <div
        className={`flex w-full mt-2 items-center justify-between text-[11px] text-white/40 ${
          !fetchOwn ? 'flex' : 'hidden'
        }`}
      >
        <span>{headerText}</span>
        <div>
          {tokenName?.toUpperCase() ?? ''} Balance:{' '}
          {bal
            ? parseFloat(formatUnits(bal?.value, bal?.decimals)).toLocaleString(
                'en-US',
                {
                  maximumFractionDigits: 3
                }
              )
            : max}
          {handleInput && (
            <button
              className={`text-accent ml-2`}
              onClick={() => {
                handleMax(bal ? formatUnits(bal?.value, bal?.decimals) : max);
                setMaxTokenForUtilization &&
                  setMaxTokenForUtilization({
                    value: bal?.value ?? BigInt(0),
                    decimals: bal?.decimals ?? 18
                  });
              }}
            >
              MAX
            </button>
          )}
        </div>
      </div>
      <div
        className={`flex max-w-full mt-2 items-center justify-between text-md gap-x-1`}
      >
        <input
          className={`focus:outline-none amount-field font-bold bg-transparent disabled:text-white/60 flex-auto flex w-full truncate`}
          placeholder={`0.0`}
          type="number"
          value={
            fetchOwn
              ? bal &&
                parseFloat(
                  formatUnits(bal?.value, bal?.decimals)
                ).toLocaleString('en-US', {
                  maximumFractionDigits: 3
                })
              : amount
          }
          onChange={(e) => handlInpData(e)}
          disabled={handleInput ? false : true}
        />
        <div
          className={`ml-auto min-w-max px-0.5 flex items-center justify-end`}
        >
          {tokenSelector ? (
            <TokenSelector
              newRef={newRef}
              open={open}
              setOpen={setOpen}
              tokenArr={tokenArr}
            />
          ) : (
            renderTokenDisplay()
          )}
        </div>
      </div>
      {useSlider && (
        <div className="mt-4 space-y-2">
          <PrecisionSlider
            value={utilizationPercentage}
            onChange={handleSliderChange}
            max={100}
            min={0}
            step={sliderStep}
          />
          <div className="w-full flex justify-between text-xs text-white/60">
            <span className={utilizationPercentage >= 25 ? 'text-accent' : ''}>
              25%
            </span>
            <span className={utilizationPercentage >= 50 ? 'text-accent' : ''}>
              50%
            </span>
            <span className={utilizationPercentage >= 75 ? 'text-accent' : ''}>
              75%
            </span>
            <span className={utilizationPercentage >= 100 ? 'text-accent' : ''}>
              100%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(MaxDeposit), { ssr: false });
