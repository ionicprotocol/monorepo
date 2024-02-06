/* eslint-disable @next/next/no-img-element */
'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
// import { useStore } from "@/store/Store";

export default function Navbar() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const pathname = usePathname();

  // useEffect(()=>{
  //   console.log(pathbox.current.getElementsByClassName(pathname));

  // },[pathname])
  return (
    <nav className="fixed z-50 flex items-center justify-between w-full py-2 sm:py-4 px-[4%] text-lg text-white/50 transition-all duration-300 ease-linear -translate-x-1/2 font-inter top-0 left-1/2 rounded-xl bg-black">
      <div className="absolute w-full top-full left-0 bg-lime text-center p-2 text-darkone text-sm">
        Hello, Mode! Ionic is open for deposits! Supply ETH, USDC, or USDT to
        earn Ionic points. Borrowing will be open soon...
      </div>
      <Link
        className={`flex items-center  pr-10  `}
        href={'/'}
      >
        <img
          alt="logo"
          className={`h-5 `}
          src="/img/logo/logo.png"
        />
      </Link>

      <div
        className={` flex items-end  justify-end md:justify-between md:w-full flex-col md:flex-row `}
      >
        <div
          className="flex items-center justify-center p-1 px-6 transition-all duration-300 ease-linear rounded-full cursor-pointer md:hidden"
          onClick={() => setIsActive((prev: boolean) => !prev)}
        >
          {!isActive ? (
            <img
              alt="menu"
              className={` duration-100 transition-all ease-linear`}
              src="/img/menu.png"
              width={'38'}
            />
          ) : (
            <img
              alt="menu"
              className={` duration-100 transition-all ease-linear rotate-45`}
              src="/img/plus.png"
              width={'38'}
            />
          )}
        </div>

        <div
          className={`  ${
            isActive
              ? 'flex flex-col  md:flex-row my-auto gap-2 items-center justify-center '
              : ' hidden md:flex md:items-center md:justify-center my-auto   gap-1  text-sm'
          }`}
        >
          <Link
            className="pointer-events-none relative"
            href={'/'}
          >
            <span className="absolute px-[5px] top-[90%] right-[50%] translate-x-1/2 bg-lime rounded-lg text-xxs text-darkone whitespace-nowrap	">
              Soon!
            </span>
            <p
              className={`${
                pathname == '/points' ? 'text-accent' : null
              } px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer `}
            >
              Points
            </p>
          </Link>
          <Link
            className="pointer-events-none relative"
            href={'/'}
          >
            <span className="absolute px-[5px] top-[90%] right-[50%] translate-x-1/2 bg-lime rounded-lg text-xxs text-darkone whitespace-nowrap	">
              Soon!
            </span>
            <p
              className={`${
                pathname == '/dashboard' ? 'text-accent' : null
              } px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer `}
            >
              Dashboard
            </p>
          </Link>
          {/* <Link href={`/lend`}>
            <p
              className={` ${
                pathname == '/lend' ? 'text-accent' : null
              } px-4 text-center transition-all duration-200 ease-linear rounded-md cursor-pointer`}
            >
              Lend
            </p>
          </Link> */}
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

        <div
          className={`  ${
            isActive
              ? 'flex flex-col  my-2 mx-auto uppercase connect-button'
              : ' hidden md:flex md:items-center md:justify-center gap-4 my-auto uppercase connect-button'
          }`}
        >
          <ConnectButton />
          {/* <div>
            <img
              src="/img/assets/moon.png"
              alt="logo"
              className={`w-5 `}
            />
          </div> */}
        </div>
      </div>
    </nav>
  );
}
