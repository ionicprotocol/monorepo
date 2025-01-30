'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ExternalLink } from 'lucide-react';

import CustomTooltip from '@ui/components/CustomTooltip';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import { Progress } from '@ui/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@ui/components/ui/tooltip';
import { useVeIONContext } from '@ui/context/VeIonContext';

const GovernanceHeader = ({ view = 'MyVeion' }) => {
  const { balances, prices, emissions } = useVeIONContext();
  const { ion: ionBalance, veIon: veIonBalance } = balances;
  const { veIonBalanceUsd, ionBalanceUsd } = prices;

  const votingPeriodEndDate = new Date('2025-02-12');
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = votingPeriodEndDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTimeDisplay = () => {
    const { days, hours, minutes, seconds } = timeRemaining;

    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      return (
        <div className="inline-block min-w-[200px] text-right">
          Voting period has ended
        </div>
      );
    }

    return (
      <div className="font-mono inline-block min-w-[160px] text-right">
        {days}d {String(hours).padStart(2, '0')}h{' '}
        {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
      </div>
    );
  };

  const infoBlocks = [
    {
      label: 'Ion Wallet Balance',
      value: ionBalance,
      token: 'ION',
      infoContent: 'This is the amount of ION you have in your wallet.',
      icon: '/img/logo/ion.svg',
      usdValue: ionBalanceUsd
    },
    {
      label: 'YOUR VEION',
      value: veIonBalance.toFixed(3),
      token: 'veION',
      infoContent: 'This is the amount of ION you have locked in the protocol.',
      icon: '/img/logo/ion.svg',
      usdValue: veIonBalanceUsd.toFixed(5)
    },
    {
      label: 'Your Rewards',
      value: emissions.totalDeposits.amount.toString(),
      token: 'ION',
      infoContent:
        'This is the total amount of ION you have deposited in the protocol.',
      icon: '/img/logo/ion.svg',
      usdValue: emissions.totalDeposits.usdValue
    }
  ];

  return (
    <Card className="w-full bg-grayone">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {view === 'MyVeion' ? 'veION Overview' : 'My VeION'}
        </CardTitle>
        <div className="text-white/60 text-md flex items-center gap-1">
          Current voting round ends:
          <span className="text-white font-medium">{formatTimeDisplay()}</span>
        </div>
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
  usdValue: number | string;
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
  const { emissions, prices } = useVeIONContext();
  const { veIonBalanceUsd } = prices;

  const { lockedValue, totalDeposits } = emissions;
  const isActive = lockedValue.percentage >= 2.5;

  // Calculate progress values for both bars
  const firstBarProgress = Math.min(lockedValue.percentage, 2.5);
  const secondBarProgress = Math.max(0, lockedValue.percentage - 2.5);
  const secondBarMax = 97.5;

  const thresholdPercentage = 2.5;

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-2xl font-semibold">
              <h3>Emissions Status:</h3>
              <span className={isActive ? 'text-green-400' : 'text-red-400'}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-background p-2 rounded-md shadow-md">
            <p className="text-sm">
              To receive emissions, lenders/borrowers must have 2.5% of their
              collateral worth of $ION locked as $veION.
            </p>
          </TooltipContent>
        </Tooltip>
        <Link
          href="https://doc.ionic.money/ionic-documentation/tokenomics/stage-2-usdion/tokenomics"
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
            YOUR VEION: ${veIonBalanceUsd.toFixed(5)} (
            {lockedValue.percentage.toFixed(2)}
            %)
          </span>
          <CustomTooltip content="Amount of veION locked in the protocol" />
        </div>
        <div className="text-xs">TOTAL DEPOSITS: ${totalDeposits.usdValue}</div>
      </div>
    </div>
  );
};

export default GovernanceHeader;
