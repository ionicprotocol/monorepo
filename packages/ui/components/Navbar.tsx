/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { zeroAddress } from 'viem';
import { http, createConfig, useChainId, useAccount } from 'wagmi';
import { base, mode } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { cn } from '@ui/lib/utils';

import ConnectButton from './ConnectButton';
import DynamicSubNav from './DynamicSubNav';
import { BlackCreateWalletButton } from './navbar/BlackCreateWalletButton';

const SwapWidget = dynamic(() => import('../components/markets/SwapWidget'), {
  ssr: false
});

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

const NavLink = ({
  href,
  label,
  isActive,
  soon,
  isNew,
  external
}: {
  href: string;
  label: string;
  isActive?: boolean;
  soon?: boolean;
  isNew?: boolean;
  external?: boolean;
}) => (
  <Link
    href={href}
    className="relative mb-2 lg:mb-0"
    {...(external ? { target: '_blank' } : {})}
  >
    <div className="relative inline-block">
      <p
        className={cn(
          'lg:px-2 xl:px-4 text-center transition-colors duration-200 hover:text-accent cursor-pointer',
          isActive && 'text-accent'
        )}
      >
        {label}
      </p>
      {soon && (
        <span className="absolute px-[5px] -bottom-2.5 left-1/2 -translate-x-1/2 bg-accent rounded-lg text-xxs text-darkone whitespace-nowrap">
          SOON!
        </span>
      )}
      {isNew && (
        <span className="absolute px-[5px] -bottom-2.5 left-1/2 -translate-x-1/2 bg-accent rounded-lg text-xxs text-darkone whitespace-nowrap">
          NEW!
        </span>
      )}
    </div>
  </Link>
);

export default function Navbar() {
  const [isActive, setIsActive] = useState(false);
  const [swapWidgetOpen, setSwapWidgetOpen] = useState(false);
  const pathname = usePathname();
  const { dropChain } = useMultiIonic();
  const chainId = useChainId();
  const { isConnected } = useAccount();

  return (
    <nav className="fixed z-40 flex items-center w-full py-2 sm:py-4 px-[3%] xl:px-[4%] text-lg text-white/50 -translate-x-1/2 font-inter top-0 left-1/2 rounded-xl bg-black">
      <DynamicSubNav />

      <div className="flex items-center flex-1">
        <Link
          href={`/market?chain=${dropChain}&pool=0`}
          className="flex items-center lg:pr-1 xl:pr-10 pr-4"
        >
          <img
            src="/img/logo/logo.png"
            alt="Ionic Logo"
            className="min-w-[20px] max-w-[80px]"
          />
        </Link>

        <div
          className={cn(
            'absolute z-30 lg:static top-full left-0 w-full',
            'flex flex-col lg:flex-row items-center',
            'py-4 lg:py-0 gap-y-3 text-sm',
            'bg-black lg:bg-transparent',
            'transition-transform nav overflow-visible',
            isActive && 'nav-opened'
          )}
        >
          <NavLink
            href={`/market?chain=${dropChain}&pool=0`}
            label="Markets"
            isActive={pathname === '/' || pathname === '/market'}
          />
          <NavLink
            href={`/stake?chain=${chainId === mode.id || chainId === base.id ? chainId : '34443'}`}
            label="Stake"
          />
          <NavLink
            href="/dashboard"
            label="Dashboard"
            isActive={pathname === '/dashboard'}
          />
          <NavLink
            href="/earn"
            label="Earn"
            isActive={pathname === '/earn'}
          />
          <NavLink
            href="/claim"
            label="Claim"
            isActive={pathname === '/claim'}
          />

          <div className="relative mb-2 lg:mb-0">
            <p
              className="lg:px-2 xl:px-4 text-center transition-colors duration-200 hover:text-accent cursor-pointer"
              onClick={() => setSwapWidgetOpen(true)}
            >
              Bridge
            </p>
          </div>

          <NavLink
            href="/xION?chain=34443&toChain=8453"
            label="xION"
            isActive={pathname === '/xION'}
          />
          <NavLink
            href="/veion"
            label="veION"
            isNew
            external
          />

          {!isConnected && (
            <div className="relative mb-2 lg:mb-0 lg:ml-auto mr-2">
              <BlackCreateWalletButton />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-auto uppercase">
        <ConnectButton />

        <div
          className={`nav-btn lg:hidden ${
            isActive && 'nav-opened'
          } md:mx-2 mx-1`}
          onClick={() => setIsActive(!isActive)}
        />
      </div>

      <SwapWidget
        open={swapWidgetOpen}
        close={() => setSwapWidgetOpen(false)}
        toChain={+dropChain}
        fromChain={+dropChain === base.id ? mode.id : base.id}
        toToken={zeroAddress}
      />
    </nav>
  );
}
