import { useState } from 'react';

import { format } from 'date-fns';
import { isAddress } from 'viem';

import { Button } from '@ui/components/ui/button';
import { Input } from '@ui/components/ui/input';
import { Separator } from '@ui/components/ui/separator';

import CustomTooltip from '../../CustomTooltip';

export function MergeLps({ lockedUntil }: { lockedUntil: Date }) {
  const [delegateAddress, setDelegateAddress] = useState('');
  const isValidAddress = delegateAddress ? isAddress(delegateAddress) : false;

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <p className="text-[10px] text-white/50">veION</p>
      <p>#10990</p>
      <p className="text-[10px] text-white/50 mt-3">Merge To</p>
      <Input
        placeholder="0x..."
        onChange={(e) => setDelegateAddress(e.target.value)}
        className={!isValidAddress && delegateAddress ? 'border-red-500' : ''}
      />
      <Separator className="bg-white/10 my-5" />

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-2">
          VOTING POWER
          <CustomTooltip content="Your voting power diminishes each day closer to the end of the token lock period." />
        </div>
        <p>0.00 veIon</p>
      </div>

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        LOCKED Until
        <p>{format(lockedUntil, 'dd MMM yyyy')}</p>
      </div>
      <Button
        className="w-full bg-accent text-black mt-4"
        disabled={!isValidAddress}
      >
        Merge
      </Button>
    </div>
  );
}
