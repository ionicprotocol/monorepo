/* eslint-disable @next/next/no-img-element */
'use client';
// import { Gasbot } from '@gasbot/widget';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
// import '@gasbot/widget/style.css';

import ConnectButton from './ConnectButton';
import { useChainId } from 'wagmi';
import { base, mode } from 'viem/chains';

// import { useEthersSigner } from '@ui/hooks/useEthersSigner';
// import { useStore } from "@/store/Store";

export default function Navbar() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const pathname = usePathname();
  const chainId = useChainId();
  // const signer = useEthersSigner();

  // useEffect(()=>{
  //   console.log(pathbox.current.getElementsByClassName(pathname));

  // },[pathname])
  return (
    <nav className="fixed z-50 flex items-center justify-between w-full py-2 sm:py-4 px-[4%] text-lg text-white/50 transition-all duration-300 ease-linear -translate-x-1/2 font-inter top-0 left-1/2 rounded-xl bg-black">
      <div
        className={`${
          chainId === base.id
            ? 'bg-baseblue text-white'
            : 'bg-lime text-darkone'
        } absolute w-full top-full left-0 text-center p-2 text-sm font-medium`}
      >
        Hello, {chainId === base.id ? 'Base' : 'Mode'}! Ionic is open for
        lending and borrowing! Supply assets to earn Ionic points. Borrow to
        earn multiplied points!
      </div>
      <Link
        className={`flex items-center  md:pr-10  `}
        href={'/'}
      >
        <img
          alt="logo"
          className={`w-[80px] min-w-[80px]`}
          height="20"
          src="/img/logo/logo.png"
          width="80"
        />
      </Link>

      <div
        className={`
          md:flex items-end  justify-end md:justify-between md:w-full flex-col md:flex-row 
        `}
      >
        <div
          className={`absolute md:static top-full left-0 py-4 md:py-0 w-full md:w-auto flex flex-col md:flex-row md:items-center md:justify-center my-auto   gap-1  text-sm bg-black md:bg-transparent transition-transform nav ${
            isActive && 'nav-opened'
          }`}
        >
          <Link
            className="relative mb-2 md:mb-0"
            href={'/'}
          >
            <p
              className={`${
                pathname == '/' ? 'text-accent' : null
              } px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer hover:text-accent`}
            >
              Markets
            </p>
          </Link>
          <Link
            className="relative mb-2 md:mb-0"
            href={'/points'}
          >
            <span className="absolute px-[5px] top-[90%] right-[50%] translate-x-1/2 bg-accent rounded-lg text-xxs text-darkone whitespace-nowrap	">
              NEW!
            </span>
            <p
              className={`${
                pathname == '/points' ? 'text-accent' : null
              } px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer hover:text-accent`}
            >
              Points
            </p>
          </Link>
          <Link
            className="relative mb-2 md:mb-0"
            href={'/dashboard'}
          >
            <span className="absolute px-[5px] top-[90%] right-[50%] translate-x-1/2 bg-accent rounded-lg text-xxs text-darkone whitespace-nowrap	">
              NEW!
            </span>
            <p
              className={`${
                pathname == '/dashboard' ? 'text-accent' : null
              } px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer hover:text-accent`}
            >
              Dashboard
            </p>
          </Link>
          {/* <Gasbot.CustomRender
            limitDestination={34443}
            walletClientOrSigner={signer}
          >
            {({ openGasbotModal }) => (
              <Link
                className="relative mb-2 md:mb-0"
                href="#"
                onClick={openGasbotModal}
              >
                <p
                  className={`hover:text-accent null px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer text-white/50`}
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
              } px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer `}
            >
              Market
            </p>
          </Link> */}
          {/* <Link href={`/borrow`}>
            <p
              className={`${
                pathname == '/borrow' ? 'text-accent' : null
              } px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer `}
            >
              Borrow
            </p>
          </Link>
           */}
          <Link
            className="relative"
            href="https://app.mode.network/"
            target="_blank"
          >
            <p
              className={`hover:text-accent px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer`}
            >
              Bridge
            </p>
          </Link>
        </div>

        <div className="flex items-center md:justify-center gap-4 my-auto uppercase connect-button">
          <ConnectButton />

          <div
            className={`nav-btn md:hidden ${isActive && 'nav-opened'}`}
            onClick={() => setIsActive(!isActive)}
          />
        </div>
      </div>
    </nav>
  );
}
