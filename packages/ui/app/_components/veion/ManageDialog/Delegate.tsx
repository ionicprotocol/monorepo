import { useState } from 'react';

import { InfoIcon } from 'lucide-react';
import { isAddress } from 'viem';

import { Button } from '@ui/components/ui/button';
import { Input } from '@ui/components/ui/input';

export function Delegate() {
  const [delegateAddress, setDelegateAddress] = useState('');
  const isValidAddress = delegateAddress ? isAddress(delegateAddress) : false;

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <p>Delegate Address</p>
      <Input
        placeholder="0x..."
        onChange={(e) => setDelegateAddress(e.target.value)}
        className={!isValidAddress && delegateAddress ? 'border-red-500' : ''}
      />
      <div className="border border-yellow-200 text-yellow-200 text-xs flex items-center gap-3 rounded-md py-2.5 px-4 mt-2">
        <InfoIcon className="h-5 w-5 flex-shrink-0" />
        <span>
          You may delegate your voting power to any user, without transferring
          the tokens. You may revoke it, but the user will still be able to vote
          until the end of the current voting period.
        </span>
      </div>
      <Button
        className="w-full bg-accent text-black mt-4"
        disabled={!isValidAddress}
      >
        Delegate veION
      </Button>
    </div>
  );
}
