'use client';

import { useEffect } from 'react';

import { formatEther, type Address, zeroAddress } from 'viem';
import { useReadContract } from 'wagmi';

import { getToken } from '@ui/utils/getStakingTokens';

import { xErc20HyperlaneAbi } from '@ionicprotocol/sdk';

interface IQuotes {
  chain: number;
  bridgeAddress: Address;
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
  bridgeAddress,
  getQuote,
  args = {
    destinationChain: 34443,
    token: getToken(+chain),
    amount: BigInt(0),
    toAddress: zeroAddress
  }
}: IQuotes) {
  // const ;
  const { data: quotation } = useReadContract({
    abi: xErc20HyperlaneAbi,
    address: bridgeAddress,
    args: [args.destinationChain, args.token, args.amount, args.toAddress],
    functionName: 'quote',
    chainId: +chain,
    query: {
      enabled: true,
      notifyOnChangeProps: ['data', 'error'],
      refetchInterval: 10000
    }
  });

  useEffect(() => {
    if (quotation) getQuote(formatEther(quotation));
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
                Number(formatEther(args.amount)) * 0.001
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
            <span className="text-white/50">Bridge Gas</span>
            <span className={`flex items-center justify-center gap-2`}>
              {quotation
                ? Number(formatEther(quotation)).toLocaleString('en-US', {
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
