import { useState } from 'react';

import { format } from 'date-fns';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Input } from '@ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ui/components/ui/select';
import { Separator } from '@ui/components/ui/separator';
import { useManageMyVeION } from '@ui/hooks/veion/useManageMyVeION';

import CustomTooltip from '../../CustomTooltip';

type LP = {
  id: string;
  votingPower: string;
  lockedUntil: Date;
};

type MergeLpsProps = {
  chain: string;
  availableLPs?: LP[];
  lockedUntil: Date;
};

export function MergeLps({
  chain,
  availableLPs = [],
  lockedUntil
}: MergeLpsProps) {
  const [selectedLp, setSelectedLp] = useState<string>('');
  const [toAddress, setToAddress] = useState('');
  const isValidAddress = toAddress ? isAddress(toAddress) : false;

  const { address } = useAccount();
  const { merge, isPending } = useManageMyVeION(Number(chain));

  // Mock data for demonstration - replace with actual LP data
  const mockLPs: LP[] =
    availableLPs.length > 0
      ? availableLPs
      : [
          {
            id: '10990',
            votingPower: '100.00',
            lockedUntil: new Date('2024-12-31')
          },
          {
            id: '10991',
            votingPower: '50.00',
            lockedUntil: new Date('2024-11-30')
          },
          {
            id: '10992',
            votingPower: '75.00',
            lockedUntil: new Date('2024-10-31')
          }
        ];

  const selectedLpData = mockLPs.find((lp) => lp.id === selectedLp);

  const handleMerge = async () => {
    if (!isValidAddress || !selectedLp) return;

    await merge({
      fromTokenId: selectedLp as `0x${string}`,
      toTokenId: toAddress as `0x${string}`
    });
  };

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <p className="text-[10px] text-white/50">Select veION to merge from</p>
      <Select
        onValueChange={setSelectedLp}
        value={selectedLp}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select LP position" />
        </SelectTrigger>
        <SelectContent>
          {mockLPs.map((lp) => (
            <SelectItem
              key={lp.id}
              value={lp.id}
            >
              #{lp.id} - {lp.votingPower} veION
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p className="text-[10px] text-white/50 mt-3">Merge To</p>
      <Input
        placeholder="0x..."
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        className={!isValidAddress && toAddress ? 'border-red-500' : ''}
      />

      <Separator className="bg-white/10 my-5" />

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-2">
          VOTING POWER
          <CustomTooltip content="Your voting power diminishes each day closer to the end of the token lock period." />
        </div>
        <p>{selectedLpData?.votingPower || '0.00'} veIon</p>
      </div>

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        LOCKED Until
        <p>
          {format(selectedLpData?.lockedUntil || lockedUntil, 'dd MMM yyyy')}
        </p>
      </div>

      <Button
        className="w-full bg-accent text-black mt-4"
        disabled={!isValidAddress || !selectedLp || !address || isPending}
        onClick={handleMerge}
      >
        {isPending ? 'Merging...' : 'Merge'}
      </Button>
    </div>
  );
}
