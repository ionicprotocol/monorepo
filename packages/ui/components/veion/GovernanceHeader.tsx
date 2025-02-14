'use client';

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
  TooltipTrigger,
  TooltipContent
} from '@ui/components/ui/tooltip';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useVotingPeriod } from '@ui/hooks/veion/useVotingPeriod';
import { getChainName } from '@ui/constants/mock';
import { ChainId } from '@ui/types/veION';

const GovernanceHeader = ({
  view = 'MyVeion',
  chain
}: {
  view?: string;
  chain: string;
}) => {
  const { balances, prices, emissions } = useVeIONContext();
  const { ion: ionBalance, veIon: veIonBalance } = balances;
  const { veIonBalanceUsd, ionBalanceUsd } = prices;

  const { timeRemaining, isVotingClosed } = useVotingPeriod(chain);
  const { days, hours, minutes, seconds } = timeRemaining;

  const formatTimeDisplay = () => {
    if (isVotingClosed) {
      return (
        <div className="inline-flex items-center gap-2">
          <span className="text-yellow-500">Voting period closed</span>
          <span className="font-mono text-white">
            ({days}d {String(hours).padStart(2, '0')}h{' '}
            {String(minutes).padStart(2, '0')}m{' '}
            {String(seconds).padStart(2, '0')}s)
          </span>
        </div>
      );
    }

    return (
      <div className="font-mono inline-block min-w-[160px] text-right">
        <span className="text-green-400">
          {days}d {String(hours).padStart(2, '0')}h{' '}
          {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}
          s
        </span>
      </div>
    );
  };

  const infoBlocks = [
    {
      label: 'ION BALANCE',
      value: ionBalance,
      token: 'ION',
      infoContent: 'ION balance held in your wallet.',
      icon: '/img/logo/ion.svg',
      usdValue: ionBalanceUsd
    },
    {
      label: 'YOUR VEION',
      value: veIonBalance.toFixed(3),
      token: 'veION',
      infoContent: 'veION amount locked on a given chain.',
      icon: '/img/symbols/32/color/veion.png',
      usdValue: veIonBalanceUsd.toFixed(2)
    },
    {
      label: 'ION REWARDS',
      value: emissions.totalDeposits.amount.toString(),
      token: 'ION',
      infoContent: 'Pending ION rewards.',
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
          {isVotingClosed
            ? 'Time until next voting period:'
            : 'Current voting round ends in:'}
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
      {label}
      <CustomTooltip content={infoContent} />
    </div>
    <div className="text-white/60 text-xs flex flex-col">
      <div className="flex items-center">
        <Image
          alt="ion logo"
          width={32}
          height={32}
          className="inline-block rounded-full"
          src={icon}
        />
        <span className="text-white text-lg ml-1">
          {Number(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}{' '}
          {token}
        </span>
      </div>
    </div>
    <span className="text-white/40 text-sm">${usdValue}</span>
  </div>
);

const EmissionsStatus = () => {
  const { prices, currentChain } = useVeIONContext();
  const { veIonBalanceUsd } = prices;

  const { data: marketData, isLoading: isLoadingMarketData } = useFusePoolData(
    currentChain === 34443 ? '1' : '0',
    +currentChain
  );

  const yourDeposits =
    (marketData?.totalSupplyBalanceFiat || 0) + veIonBalanceUsd;

  const veionPercentageVsTotalLocked = (veIonBalanceUsd / yourDeposits) * 100;

  const isActive = veionPercentageVsTotalLocked >= 2.5;

  // Calculate progress values for both bars
  const firstBarProgress = Math.min(veionPercentageVsTotalLocked, 2.5);
  const secondBarProgress = Math.max(0, veionPercentageVsTotalLocked - 2.5);
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
              Activation Threshold: To receive emissions, 2.5% of your
              collateral worth have to be locked as veION.
            </p>
          </TooltipContent>
        </Tooltip>
        <Link
          href="https://doc.ionic.money/ionic-documentation/tokenomics/stage-2-usdion/veion"
          className="text-green-400 hover:text-green-500 p-0 h-auto flex items-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-sm">Learn More</span>
          <ExternalLink className="w-5 h-5 ml-2" />
        </Link>
      </div>

      <div className="flex gap-2">
        <div className="w-full relative group">
          <CustomTooltip
            content={`${veionPercentageVsTotalLocked.toFixed(2)}% of your collateral worth locked as veION`}
          >
            <div className="flex gap-2">
              <div className="w-[10%]">
                <Progress
                  value={(firstBarProgress / thresholdPercentage) * 100}
                  className="[&>div]:rounded-l-md [&>div]:rounded-r-none"
                />
              </div>
              <div className="w-[90%]">
                <Progress
                  value={(secondBarProgress / secondBarMax) * 100}
                  className="[&>div]:rounded-l-none [&>div]:rounded-r-md"
                />
              </div>
            </div>
          </CustomTooltip>
        </div>
      </div>

      <div className="flex justify-between items-center text-gray-400">
        <CustomTooltip
          content={`Your total veION on ${getChainName(currentChain as ChainId)}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs">
              YOUR VEION: ${veIonBalanceUsd.toFixed(2)} (
              {veionPercentageVsTotalLocked.toFixed(4)}%)
            </span>
          </div>
        </CustomTooltip>
        <CustomTooltip
          content={`Your total deposits into the Ionic Protocol on ${getChainName(currentChain as ChainId)}`}
        >
          <div className="text-xs">
            YOUR DEPOSITS:{' '}
            {yourDeposits.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </CustomTooltip>
      </div>
    </div>
  );
};

export default GovernanceHeader;
