'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ExternalLink } from 'lucide-react';

import { Button } from '@ui/components/ui/button';
import { Card, CardContent, CardHeader } from '@ui/components/ui/card';
import { Dialog, DialogTrigger } from '@ui/components/ui/dialog';

import VeIonDialog from '../_components/veion/VeIonDialog';

export default function VeIon() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card className="lg:w-[60%] w-[80%] lg:p-8 text-white bg-grayone mx-auto my-6">
      <VeIonDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      <CardHeader className="xl:text-xl text-2xl font-semibold space-y-5 p-0">
        <img
          className="size-16"
          src="/img/assets/db.png"
          alt="down-right--v1"
        />
        <div className="flex items-center gap-1 text-2xl">
          Participate in{' '}
          <span className="text-accent flex items-center">
            Emissions{' '}
            <ExternalLink
              className="ml-1"
              size={24}
            />
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-full text-white/60 grid grid-cols-6 xl:gap-4 gap-3 md:gap-y-7 gap-y-3 *:text-xs p-0 pt-6">
        {/* Info Cards */}
        {[
          'Incentive Market on your favourite chain with Liquidity Guages',
          'Significantly boost your collateral pool depth with bribes',
          'Increase Emissions and earn POL for your Treasury'
        ].map((text) => (
          <Card
            key={text}
            className="col-span-2 bg-graylite p-2 xl:p-5"
          >
            <CardContent className="p-0 space-y-3">
              <img
                className="w-4 h-4"
                src="https://img.icons8.com/ios/50/ffffff/down-right--v1.png"
                alt="down-right--v1"
              />
              <p className="text-left text-xs">{text}</p>
            </CardContent>
          </Card>
        ))}

        {/* Total LP Card */}
        <Card className="md:col-span-2 col-span-3 bg-graylite">
          <CardContent className="space-y-3 p-5">
            <p className="text-xs">TOTAL LP</p>
            <div className="flex flex-wrap md:gap-3">
              <span className="flex">
                <img
                  src="/img/logo/ION.png"
                  alt="logo"
                  className="size-6 rounded-full"
                />
                <img
                  src="/img/logo/ETH.png"
                  alt="logo"
                  className="size-6 rounded-full -ml-2"
                />
              </span>
              <p className="text-white font-semibold text-md">$1,234,432.21</p>
            </div>
          </CardContent>
        </Card>

        {/* Provide LP Card */}
        <Card className="md:col-span-4 col-span-6 bg-graylite">
          <CardContent className="space-y-3 p-5">
            <p className="text-xs font-light">PROVIDE LP ON DEX</p>
            <div className="flex items-center justify-between gap-2 xl:gap-6">
              <span className="flex">
                <img
                  src="/img/logo/ION.png"
                  alt="logo"
                  className="size-6 rounded-full"
                />
                <img
                  src="/img/logo/ETH.png"
                  alt="logo"
                  className="size-6 rounded-full -ml-2"
                />
              </span>
              <p className="text-white font-medium text-md">ION/WETH</p>
              <Button
                variant="secondary"
                className="bg-green-400 text-grayUnselect text-xs font-bold"
              >
                Add Liquidity
              </Button>
              <p className="text-white font-medium text-md">ION/WETH LP</p>
            </div>
          </CardContent>
        </Card>

        {/* Total LP Locked Card */}
        <Card className="md:col-span-2 col-span-3 row-start-2 md:row-start-3 bg-graylite">
          <CardContent className="space-y-3 p-5">
            <p className="text-xs font-light">TOTAL LP LOCKED</p>
            <div className="flex items-center flex-wrap gap-3">
              <span className="flex">
                <img
                  src="/img/logo/ION.png"
                  alt="logo"
                  className="h-4 w-4 rounded-full"
                />
                <img
                  src="/img/logo/ETH.png"
                  alt="logo"
                  className="h-4 w-4 rounded-full -ml-2"
                />
              </span>
              <p className="text-white font-semibold text-md">$1,234,432.21</p>
              <img
                className="size-4 inline-block"
                src="https://img.icons8.com/forma-thin/24/ffffff/lock.png"
                alt="lock"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lock Your ION LP Card */}
        <Card className="md:col-span-4 col-span-6 bg-graylite">
          <CardContent className="space-y-3 p-5">
            <p className="text-xs font-light">LOCK YOUR ION LP</p>
            <div className="flex items-center justify-between gap-2 xl:gap-6">
              <span className="flex">
                <img
                  src="/img/logo/ION.png"
                  alt="logo"
                  className="size-6 rounded-full"
                />
                <img
                  src="/img/logo/ETH.png"
                  alt="logo"
                  className="size-6 rounded-full -ml-2"
                />
              </span>
              <p className="text-white font-medium text-md">ION/WETH</p>
              <Dialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    className="bg-accent text-grayUnselect text-xs font-bold"
                  >
                    Lock and get
                  </Button>
                </DialogTrigger>
              </Dialog>
              <p className="text-white font-medium text-md">ION/WETH LP</p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <Button
          asChild
          className="col-span-3 bg-accent text-black hover:-translate-y-1 hover:bg-accent/90"
        >
          <Link href="/veion/governance?watch=myveion">My veIon</Link>
        </Button>
        <Button
          asChild
          className="col-span-3 bg-accent text-black hover:-translate-y-1 hover:bg-accent/90"
        >
          <Link href="/veion/governance?watch=overview">veIon Overview</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
