import Image from 'next/image';

import { Card, CardContent } from '@ui/components/ui/card';
import { Checkbox } from '@ui/components/ui/checkbox';

const EpochInfo = ({
  isAcknowledged,
  setIsAcknowledged
}: {
  isAcknowledged: boolean;
  setIsAcknowledged: (checked: boolean) => void;
}) => {
  return (
    <Card className="bg-grayone">
      <CardContent className="space-y-6 p-6">
        <p className="text-white/60">
          Choose the market, pool and side to provide incentives to. ION
          emissions allocated by the voters will be given to all the veION token
          holders.
        </p>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Epoch Distribution</h2>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image
                src="/img/logo/ION.png"
                alt="ION"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span>Epoch Ends</span>
            </div>
            <span className="text-green-400">2d, 13h:30m</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image
                src="/img/logo/ION.png"
                alt="ION"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span>Ionic Emissions</span>
            </div>
            <span className="text-green-400">100,000,000</span>
          </div>

          <div className="flex items-center gap-4 text-white/60">
            <Checkbox
              id="acknowledgement"
              checked={isAcknowledged}
              onCheckedChange={setIsAcknowledged}
              className="data-[state=checked]:bg-green-400 data-[state=checked]:border-green-400"
            />
            <label
              htmlFor="acknowledgement"
              className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
