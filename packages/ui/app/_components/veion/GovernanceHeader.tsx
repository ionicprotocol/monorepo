'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ExternalLink } from 'lucide-react';

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

  // Remove the $ and convert to numbers
  const lockedAmount = Number(lockedLiquidity.replace(/[^0-9.]/g, ''));
  const totalAmount = Number(totalLiquidity.replace(/[^0-9.]/g, ''));

  // Calculate percentages
  const lockedPercentage = (lockedAmount / totalAmount) * 100;
  const thresholdPercentage = 2.5;
  const isActive = lockedPercentage >= thresholdPercentage;

  // Calculate progress values for both bars
  const firstBarProgress = Math.min(lockedPercentage, thresholdPercentage);
  const secondBarProgress = Math.max(0, lockedPercentage - thresholdPercentage);
  const secondBarMax = 100 - thresholdPercentage;

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <h3>Emissions Status:</h3>
          <span className={isActive ? 'text-green-400' : 'text-red-400'}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
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

      <div className="flex gap-2">
        {/* First 2.5% bar */}
        <div className="w-[22.5%] relative group">
          <CustomTooltip
            content={`${firstBarProgress.toFixed(2)}% / ${thresholdPercentage}% (Activation Threshold)`}
          >
            <div className="w-full">
              <Progress
                value={(firstBarProgress / thresholdPercentage) * 100}
                className="[&>div]:rounded-l-md [&>div]:rounded-r-none"
              />
            </div>
          </CustomTooltip>
        </div>

        {/* Remaining 97.5% bar */}
        <div className="w-[77.5%] relative group">
          <CustomTooltip
            content={`${secondBarProgress.toFixed(2)}% / ${secondBarMax}% (Additional Voting Power)`}
          >
            <div className="w-full">
              <Progress
                value={(secondBarProgress / secondBarMax) * 100}
                className="[&>div]:rounded-l-none [&>div]:rounded-r-md"
              />
            </div>
          </CustomTooltip>
        </div>
      </div>

      <div className="flex justify-between items-center text-gray-400">
        <div className="flex items-center gap-2">
          <span className="text-xs">
            LOCKED VEION: ${lockedAmount.toLocaleString()} (
            {lockedPercentage.toFixed(1)}%)
          </span>
          <CustomTooltip content="Amount of veION locked in the protocol" />
        </div>
        <div className="text-xs">
          TOTAL DEPOSITS: ${totalAmount.toLocaleString()}
        </div>
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
