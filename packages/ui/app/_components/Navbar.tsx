/* eslint-disable @next/next/no-img-element */
'use client';
// import { Gasbot } from '@gasbot/widget';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
// import { base } from 'viem/chains';
// import { useChainId } from 'wagmi';
// import '@gasbot/widget/style.css';
import { http, createConfig } from 'wagmi';
import { base, mode } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

import ConnectButton from './ConnectButton';
import DynamicSubNav from './DynamicSubNav';
import { BlackCreateWalletButton } from './navbar/BlackCreateWalletButton';

import { useStore } from 'ui/store/Store';
// import { useEthersSigner } from '@ui/hooks/useEthersSigner';

export const config = createConfig({
  chains: [base, mode],
  connectors: [
    coinbaseWallet({
      appName: 'Create Wagmi',
      preference: 'smartWalletOnly'
    })
  ],
  transports: {
    [base.id]: http(),
    [mode.id]: http()
  }
});

export default function Navbar() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const pathname = usePathname();
  const dropChain = useStore((state) => state.dropChain);
  // const signer = useEthersSigner();

  // useEffect(()=>{
  //   console.log(pathbox.current.getElementsByClassName(pathname));

  // },[pathname])
  return (
    <nav className="fixed z-50 flex items-center justify-between w-full py-2 sm:py-4 px-[3%]  xl:px-[4%] text-lg text-white/50 transition-all duration-300 ease-linear -translate-x-1/2 font-inter top-0 left-1/2 rounded-xl bg-black ">
      <DynamicSubNav />
      <Link
        className={`flex items-center  lg:pr-1 xl:pr-10 pr-4 `}
        href={`/market?chain=${dropChain}&pool=0`}
      >
        <img
          alt="logo"
          className={` min-w-[20px] max-w-[80px]`}
          src="/img/logo/logo.png"
        />
      </Link>

      <div
        className={`
          lg:flex items-end  justify-end lg:justify-between lg:w-full flex-col lg:flex-row 
        `}
      >
        <div
          className={`absolute z-50 lg:static top-full left-0 py-4 lg:py-2 w-full  flex flex-col lg:flex-row lg:items-center lg:justify-center my-auto    gap-y-3  text-sm bg-black lg:bg-transparent transition-transform nav overflow-x-hidden ${
            isActive && 'nav-opened'
          }`}
        >
          <Link
            className="relative mb-2 lg:mb-0"
            href={`/market?chain=${dropChain}&pool=0`}
          >
            <p
              className={`${
                pathname == '/' || pathname == '/market' ? 'text-accent' : null
              } lg:px-2 xl:px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer hover:text-accent`}
            >
              Markets
            </p>
          </Link>
          <Link
            className="relative mb-2 lg:mb-0"
            href="/stake"
          >
            <span className="absolute px-[5px] top-[90%] right-[50%] translate-x-1/2 bg-accent rounded-lg text-xxs text-darkone whitespace-nowrap	">
              NEW!
            </span>
            <p
              className={`hover:text-accent lg:px-2 xl:px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer`}
            >
              Stake
            </p>
          </Link>
          <Link
            className="relative mb-2 lg:mb-0"
            href={'/points'}
          >
            <p
              className={`${
                pathname == '/points' ? 'text-accent' : null
              } lg:px-2 xl:px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer hover:text-accent`}
            >
              Points
            </p>
          </Link>
          <Link
            className="relative mb-2 lg:mb-0"
            href={'/dashboard'}
          >
            <p
              className={`${
                pathname == '/dashboard' ? 'text-accent' : null
              } lg:px-2 xl:px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer hover:text-accent`}
            >
              Dashboard
            </p>
          </Link>
          <Link
            className="relative mb-2 lg:mb-0"
            href="/earn"
          >
            <p
              className={` ${
                pathname == '/earn' ? 'text-accent' : null
              } hover:text-accent lg:px-2 xl:px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer`}
            >
              Earn
            </p>
          </Link>
          <Link
            className="relative mb-2 lg:mb-0"
            href="/claim"
          >
            <p
              className={` ${
                pathname == '/claim' ? 'text-accent' : null
              } hover:text-accent lg:px-2 xl:px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer`}
            >
              Claim
            </p>
          </Link>
          {/* <Gasbot.CustomRender
            limitDestination={34443}
            walletClientOrSigner={signer}
          >
            {({ openGasbotModal }) => (
              <Link
                className="relative mb-2 lg:mb-0"
                href="#"
                onClick={openGasbotModal}
              >
                <p
                  className={`hover:text-accent null lg:px-2 xl:px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer text-white/50`}
                >
                  Get Gas
                </p>
              </Link>
            )}
          </Gasbot.CustomRender> */}
          {/* <Link href={`/market`}>
            <p
              className={`${
                pathname == '/market' ? 'text-accent' : null
              } lg:px-2 xl:px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer `}
            >
              Market
            </p>
          </Link> */}
          {/* <Link href={`/borrow`}>
            <p
              className={`${
                pathname == '/borrow' ? 'text-accent' : null
              } lg:px-2 xl:px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer `}
            >
              Borrow
            </p>
          </Link>
           */}
          <Link
            className="relative mb-2 lg:mb-0"
            href="https://app.mode.network/"
            target="_blank"
          >
            <p
              className={`hover:text-accent lg:px-2 xl:px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer`}
            >
              Bridge
            </p>
          </Link>
          <Link
            className="relative mb-2 lg:mb-0"
            href="https://bridge.connext.network/ION-from-mode-to-base?symbol=ION"
            target="_blank"
          >
            <span className="absolute px-[5px] top-[90%] right-[50%] translate-x-1/2 bg-accent rounded-lg text-xxs text-darkone whitespace-nowrap	">
              NEW!
            </span>
            <p
              className={`hover:text-accent lg:px-2 xl:px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer`}
            >
              xION
            </p>
          </Link>
          <div className="relative mb-2 lg:mb-0 lg:ml-auto ">
            <p
              className={`hover:text-accent lg:px-2 xl:px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer`}
            >
              <BlackCreateWalletButton />
            </p>
          </div>
        </div>

        <div className="flex items-center lg:justify-center gap-1.5 my-auto uppercase connect-button">
          {/*  */}
          <ConnectButton />

          <div
            className={`nav-btn lg:hidden ${
              isActive && 'nav-opened'
            } md:mx-2 mx-1`}
            onClick={() => setIsActive(!isActive)}
          />
        </div>
      </div>
    </nav>
  );
}
