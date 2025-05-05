'use client';

import Image from 'next/image';

import CustomTooltip from '@ui/components/CustomTooltip';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVotingPeriod } from '@ui/hooks/veion/useVotingPeriod';

import { EmissionsStatusTile } from '../markets/EmissionsStatusTile';

const GovernanceHeader = ({
  view = 'MyVeion',
  chain
}: {
  view?: string;
  chain: string;
}) => {
  const { balances, prices, emissions } = useVeIONContext();
  const { ion: ionBalance, veIon: veIonBalance } = balances;
  const { ionBalanceUsd } = prices;
  const veIonBalanceUsd = emissions.veIonBalanceUsd;

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
            <EmissionsStatusTile />
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

export default GovernanceHeader;
