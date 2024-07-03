'use client';
/* eslint-disable  @typescript-eslint/no-explicit-any */

// import type { Token, TokenAmount } from '@lifi/sdk';
// import {
//   ChainId,
//   getTokenBalances,
//   getTokenBalancesByChain,
//   getTokens
// } from '@lifi/sdk';
// import { useEffect, useState } from 'react';
// import { useAccount } from 'wagmi';

interface IinstantSupply {
  amount?: string;
  handleInput: (val?: string) => void;
  newRef: any;
  open: boolean;
  setOpen: () => void;
}
export default function InstantSupply({
  amount,
  handleInput,
  newRef
}: IinstantSupply) {
  // const [tokenOfChain, setTokenOfChain] = useState<TokenAmount[]>();
  // const { address } = useAccount();
  // useEffect(() => {
  //   async function getTokenByWallet() {
  //     try {
  //       if (!address) return;
  //       const tokensResponse = await getTokens();
  //       const modetokens = tokensResponse.tokens[ChainId.MOD];
  //       console.log(modetokens);
  //       const tokensByChain = {
  //         1: [
  //           {
  //             chainId: 1,
  //             address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  //             symbol: 'DAI',
  //             name: 'DAI Stablecoin',
  //             decimals: 18,
  //             priceUSD: '0.9999'
  //           }
  //         ],
  //         10: [
  //           {
  //             chainId: 10,
  //             address: '0x4200000000000000000000000000000000000042',
  //             symbol: 'OP',
  //             name: 'Optimism',
  //             decimals: 18,
  //             priceUSD: '1.9644'
  //           }
  //         ]
  //       };
  //       const tokenBalances = await getTokenBalances(
  //         '0x26f52740670Ef678b254aa3559d823C29122E9c2',
  //         modetokens
  //       );
  //       const tokenBalancesby = await getTokenBalancesByChain(
  //         '0x26f52740670Ef678b254aa3559d823C29122E9c2',
  //         tokensByChain
  //       );
  //       // setTokenOfChain(tokenBalances);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  //   getTokenByWallet();
  // }, [address]);
  // console.log(tokenOfChain);
  function handleMax(val: string) {
    handleInput(val);
  }

  function handlInpData(e: React.ChangeEvent<HTMLInputElement>) {
    handleInput(e?.target?.value);
  }
  return (
    <div ref={newRef}>
      <div className={`flex w-full text-[11px] text-white/50`}>
        <span>Amount</span>
        <span className={`ml-auto `}>Wallet Balance : 0.00</span>
        <span
          className={`ml-1 text-accent `}
          onClick={() => handleMax('123')}
        >
          Max
        </span>
      </div>
      <div>
        <input
          className={`focus:outline-none amount-field font-bold bg-transparent flex-auto block w-full`}
          onChange={handlInpData}
          placeholder={`Asset Amount`}
          // readOnly={!!readonly}
          type="number"
          value={amount}
        />
      </div>
    </div>
  );
}
