import { useState } from 'react';

import { InfoIcon } from 'lucide-react';
import { isAddress } from 'viem';

import { Button } from '@ui/components/ui/button';
import { Input } from '@ui/components/ui/input';

// TransferView.tsx
export function TransferView() {
  const [transferAddress, setTransferAddress] = useState('');
  const isValidAddress = transferAddress ? isAddress(transferAddress) : false;

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <p className="text-[10px] mb-2 text-white/50">TRANSFER ADDRESS</p>
      <Input
        placeholder="0x..."
        onChange={(e) => setTransferAddress(e.target.value)}
        className={!isValidAddress && transferAddress ? 'border-red-500' : ''}
      />
      <div className="border border-red-500 text-red-500 text-xs flex items-center gap-3 rounded-md py-2.5 px-4 mt-2">
        <InfoIcon className="h-5 w-5 flex-shrink-0" />
        <span>
          Once you transfer the tokens, you lose access to them irrevocably.
        </span>
      </div>
      <Button
        className="w-full bg-accent text-black mt-4"
        disabled={!isValidAddress}
      >
        Transfer veION
      </Button>
    </div>
  );
}
