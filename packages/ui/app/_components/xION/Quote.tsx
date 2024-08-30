'use client';

import { Options } from '@layerzerolabs/lz-v2-utilities';
import { useEffect } from 'react';
import { xErc20LayerZeroAbi } from 'sdk/src';
import { formatEther, type Hex, type Address } from 'viem';
import { useReadContract } from 'wagmi';

import { BridgingContractAddress, getToken } from '@ui/utils/getStakingTokens';

export const lzOptions = Options.newOptions()
  .addExecutorLzReceiveOption(100_000, 0)
  .toHex();

interface IQuotes {
  chain: number;
  getQuote: (data: string) => void;
  args?: {
    // fromChain?: number;
    token: Address;
    destinationChain: number;
    amount: bigint;
    toAddress: Address;
  };
}
export default function Quote({
  chain,
  getQuote,
  args = {
    destinationChain: 34443,
    token: getToken(+chain),
    amount: BigInt(0),
    toAddress: '0x26f52740670Ef678b254aa3559d823C29122E9c2' as Address
  }
}: IQuotes) {
  // const ;
  const { data: quotation } = useReadContract({
    abi: xErc20LayerZeroAbi,
    address: BridgingContractAddress[+chain],
    args: [
      args.destinationChain,
      args.token,
      args.amount,
      args.toAddress,
      lzOptions as Hex,
      false
    ],
    functionName: 'quote',
    chainId: +chain,
    query: {
      enabled: true,
      gcTime: Infinity,
      notifyOnChangeProps: ['data', 'error'],
      refetchInterval: 10000,
      initialData: [0n, 0n]
    }
  });

  useEffect(() => {
    if (quotation) getQuote(formatEther(quotation[0]));
  }, [getQuote, quotation]);
  // console.log(quotation);
  // const calculations = {
  //   willGet:
  //     Number(formatEther(args.amount)) -
  //     Number(formatEther(args.amount)) * 0.01,
  //   fees: Number(formatEther(args.amount)) * 0.01
  // };
  return (
    <div className="flex flex-col items-center justify-start gap-y-0.5 text-[11px]">
      <div className={`flex items-center justify-between w-full  `}>
        <span className="text-white/50">You Will Receive</span>
        <span className={`flex items-center justify-center gap-2`}>
          {args?.amount
            ? (
                Number(formatEther(args.amount)) -
                Number(formatEther(args.amount)) * 0.01
              ).toLocaleString('en-US', {
                maximumFractionDigits: 3
              })
            : '-'}{' '}
          ION
          <img
            alt="close"
            className={` h-3 w-3 inline-block `}
            src="/img/logo/ION.png"
          />
        </span>
      </div>
      {args.amount && (
        <>
          <div className={`flex items-center justify-between w-full  `}>
            <span className="text-white/50">Fees</span>
            <span className={`flex items-center justify-center gap-2`}>
              {(Number(formatEther(args.amount)) * 0.01).toLocaleString(
                'en-US',
                {
                  maximumFractionDigits: 3
                }
              )}{' '}
              ION
              <img
                alt="close"
                className={` h-3 w-3 inline-block `}
                src="/img/logo/ION.png"
              />
            </span>
          </div>
          <div className={`flex items-center justify-between w-full  `}>
            <span className="text-white/50">Gas</span>
            <span className={`flex items-center justify-center gap-2`}>
              {quotation
                ? Number(formatEther(quotation[0])).toLocaleString('en-US', {
                    maximumFractionDigits: 6
                  })
                : '-'}{' '}
              ETH
              <img
                alt="close"
                className={` h-3 w-3 inline-block `}
                src="/img/logo/ETH.png"
              />
            </span>
          </div>
        </>
      )}
    </div>
  );
}
