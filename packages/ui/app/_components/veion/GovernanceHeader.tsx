'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ExternalLink, HelpCircle } from 'lucide-react';

import { Button } from '@ui/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import { Progress } from '@ui/components/ui/progress';
import { useVeION } from '@ui/context/VeIonContext';

import CustomTooltip from '../CustomTooltip';

const InfoBlock = ({
  label,
  value,
  token,
  infoContent,
  icon,
  usdValue
}: {
  label: string;
  value: string;
  token: string;
  infoContent: string;
  icon: string;
  usdValue: string;
}) => (
  <div className="flex flex-col gap-1 mt-3">
    <div className="text-white/60 text-xs flex items-center gap-2">
      {label.toUpperCase()}
      <CustomTooltip content={infoContent} />
    </div>
    <div className="text-white/60 text-xs flex flex-col">
      <div className="flex items-center">
        <Image
          alt="ion logo"
          width={32}
          height={32}
          className="inline-block"
          src={icon}
        />
        <span className="text-white text-lg ml-1">
          {Number(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
          })}{' '}
          {token}
        </span>
      </div>
    </div>
    <span className="text-white/40 text-sm">${usdValue}</span>
  </div>
);

const EmissionsStatus = () => {
  const { lockedLiquidity, totalLiquidity } = useVeION();
  const progressValue = 35;
  const secondaryProgress = 25;

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <h3>Emissions Status:</h3>
          <span className="text-green-400">Active</span>
        </div>
        <Link
          href="https://placeholder.com"
          className="text-green-400 hover:text-green-500 p-0 h-auto flex items-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-sm">Learn More</span>
          <ExternalLink className="w-5 h-5 ml-2" />
        </Link>
      </div>

      <div className="relative">
        <Progress
          value={progressValue + secondaryProgress}
          className="bg-gray-200 [&>*]:bg-green-400 [&>*]:rounded-md h-3"
        />
      </div>

      <div className="flex justify-between items-center text-gray-400">
        <div className="flex items-center gap-2">
          <span className="text-xs">LOCKED VEION: {lockedLiquidity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-gray-400 hover:text-gray-300"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-xs">TOTAL DEPOSITS: {totalLiquidity}</div>
      </div>
    </div>
  );
};

const GovernanceHeader = ({ view = 'MyVeion' }) => {
  const { ionBalance, veIonBalance, isLoading, prices } = useVeION();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const infoBlocks = [
    {
      label: 'Ion Wallet Balance',
      value: ionBalance,
      token: 'ION',
      infoContent: 'This is the amount of ION you have in your wallet.',
      icon: '/img/logo/ion.svg',
      usdValue: prices.ionBalanceUsd
    },
    {
      label: 'Total veION',
      value: veIonBalance,
      token: 'veION',
      infoContent: 'This is the amount of veION you have in your wallet.',
      icon: '/img/logo/ion.svg',
      usdValue: prices.veIonBalanceUsd
    }
  ];

  return (
    <Card className="w-full bg-grayone">
      <CardHeader>
        <CardTitle>
          {view === 'MyVeion' ? 'veION Overview' : 'My VeION'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-8">
          <div className="flex gap-6">
            {infoBlocks.map((block) => (
              <InfoBlock
                key={block.label}
                {...block}
              />
            ))}
          </div>
          <div className="flex-1 max-w-[500px]">
            <EmissionsStatus />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GovernanceHeader;
