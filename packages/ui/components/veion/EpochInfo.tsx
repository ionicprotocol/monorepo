'use client';

import Image from 'next/image';

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
        <span className="text-yellow-400">
          Voting period closed ({days}d {String(hours).padStart(2, '0')}h{' '}
          {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}
          s)
        </span>
      );
    }
    return (
      <span className="text-green-400">
        {days}d {String(hours).padStart(2, '0')}h{' '}
        {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
      </span>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-grayone to-black border border-white/10 shadow-xl backdrop-blur-lg">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-accent">
          Epoch Distribution
        </h2>

        <Separator className="bg-white/5" />

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/img/logo/ION.png"
                alt="ION"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-white font-medium">Epoch Ends</span>
            </div>
            <span>{formatTimeDisplay()}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/img/logo/ION.png"
                alt="ION"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-white font-medium">Ionic Emissions</span>
            </div>
            <span className="text-green-400 font-semibold">100,000,000</span>
          </div>

          <div className="flex items-start gap-4 text-white/60">
            <Checkbox
              id="acknowledgement"
              checked={isAcknowledged}
              onCheckedChange={setIsAcknowledged}
              className="data-[state=checked]:bg-green-400 data-[state=checked]:border-green-400 mt-1"
            />
            <label
              htmlFor="acknowledgement"
              className="text-sm leading-relaxed"
            >
              I understand the incentives mechanics, and acknowledge that
              incentivizing a market is irreversible process, deposited tokens
              won&apos;t be withdrawable.
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EpochInfo;
