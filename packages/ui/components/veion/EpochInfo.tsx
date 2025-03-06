'use client';

import Image from 'next/image';

import { Clock, Coins, AlertTriangle } from 'lucide-react';

import { Card, CardContent } from '@ui/components/ui/card';
import { Checkbox } from '@ui/components/ui/checkbox';
import { Separator } from '@ui/components/ui/separator';
import { useVotingPeriod } from '@ui/hooks/veion/useVotingPeriod';

const EpochInfo = ({
  isAcknowledged,
  setIsAcknowledged,
  chain = '34443'
}: {
  isAcknowledged: boolean;
  setIsAcknowledged: (checked: boolean) => void;
  chain?: string;
}) => {
  const { timeRemaining, isVotingClosed } = useVotingPeriod(chain);
  const { days, hours, minutes, seconds } = timeRemaining;

  const formatTimeDisplay = () => {
    if (isVotingClosed) {
      return (
        <span className="text-yellow-400 flex items-center gap-1 font-medium">
          <Clock
            size={16}
            className="animate-pulse"
          />
          Voting period closed ({days}d {String(hours).padStart(2, '0')}h{' '}
          {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}
          s)
        </span>
      );
    }
    return (
      <span className="text-green-400 flex items-center gap-1 font-medium">
        <Clock size={16} />
        {days}d {String(hours).padStart(2, '0')}h{' '}
        {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
      </span>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-grayone to-black border border-white/10 shadow-xl backdrop-blur-lg">
      <CardContent className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-accent flex items-center gap-2">
            <Coins className="h-6 w-6 text-accent" />
            Epoch Distribution
          </h2>
          {!isAcknowledged && (
            <div className="flex items-center bg-yellow-500/20 text-yellow-200 text-xs font-medium py-1 px-2 rounded-full">
              <AlertTriangle
                size={12}
                className="mr-1"
              />{' '}
              Action Required
            </div>
          )}
        </div>

        <Separator className="bg-white/5" />

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/img/logo/ION.png"
                  alt="ION"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isVotingClosed ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`}
                />
              </div>
              <span className="text-white font-medium">Epoch Ends</span>
            </div>
            <div>{formatTimeDisplay()}</div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/img/logo/ION.png"
                  alt="ION"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent" />
              </div>
              <span className="text-white font-medium">Ionic Emissions</span>
            </div>
            <span className="text-green-400 font-semibold">687,500</span>
          </div>

          <div
            className={`flex items-start gap-4 p-4 rounded-md ${isAcknowledged ? 'bg-green-500/10 border border-green-400/20' : 'bg-yellow-500/10 border border-yellow-400/20'} transition-colors duration-300`}
          >
            <Checkbox
              id="acknowledgement"
              checked={isAcknowledged}
              onCheckedChange={setIsAcknowledged}
              className={`${isAcknowledged ? 'data-[state=checked]:bg-green-400 data-[state=checked]:border-green-400' : 'border-yellow-400'} mt-1`}
            />
            <div>
              <label
                htmlFor="acknowledgement"
                className={`text-sm leading-relaxed ${isAcknowledged ? 'text-green-100' : 'text-yellow-100'} font-medium`}
              >
                Incentives Acknowledgement
              </label>
              <p className="text-sm leading-relaxed text-white/70 mt-1">
                I understand the incentives mechanics, and acknowledge that
                incentivizing a market is irreversible process, deposited tokens
                won&apos;t be withdrawable.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EpochInfo;
