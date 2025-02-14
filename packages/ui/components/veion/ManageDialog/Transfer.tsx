import { useState } from 'react';

import { InfoIcon } from 'lucide-react';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

import TransactionButton from '@ui/components/TransactionButton';
import { Input } from '@ui/components/ui/input';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';

import InfoVoted from './InfoVoted';

export function Transfer() {
  const [transferAddress, setTransferAddress] = useState('');
  const isValidAddress = transferAddress ? isAddress(transferAddress) : false;
  const { selectedManagePosition } = useVeIONContext();
  const chain = Number(selectedManagePosition?.chainId);
  const hasVoted = !!selectedManagePosition?.votingStatus.hasVoted;
  const { address } = useAccount();
  const { handleTransfer } = useVeIONManage(Number(chain));

  const onTransfer = async () => {
    if (!isValidAddress || !address || !selectedManagePosition) {
      return { success: false };
    }

    const success = await handleTransfer({
      to: transferAddress as `0x${string}`
    });

    return { success };
  };

  return (
    <div className="flex flex-col gap-y-4 py-2 px-3">
      {hasVoted && <InfoVoted />}
      <div>
        <p className="text-[10px] mb-2 text-white/50">TRANSFER ADDRESS</p>
        <Input
          placeholder="0x..."
          value={transferAddress}
          onChange={(e) => setTransferAddress(e.target.value)}
          className={!isValidAddress && transferAddress ? 'border-red-500' : ''}
        />
      </div>
      <div className="border border-red-500 text-red-500 text-xs flex items-center gap-3 rounded-md py-2.5 px-4">
        <InfoIcon className="h-5 w-5 flex-shrink-0" />
        <span>
          Once you transfer the tokens, you lose access to them irrevocably.
        </span>
      </div>
      <TransactionButton
        onSubmit={onTransfer}
        isDisabled={!isValidAddress || !address || hasVoted}
        buttonText="Transfer veION"
        targetChainId={chain}
      />
    </div>
  );
}
