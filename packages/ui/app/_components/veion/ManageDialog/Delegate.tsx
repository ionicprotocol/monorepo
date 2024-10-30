import { useState } from 'react';

import { InfoIcon } from 'lucide-react';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Input } from '@ui/components/ui/input';
import { useManageMyVeION } from '@ui/hooks/veion/useManageMyVeION';
import { getAvailableStakingToken } from '@ui/utils/getStakingTokens';

type DelegateProps = {
  chain: string;
  fromTokenId?: string;
  availableAmount?: number;
};

export function Delegate({
  chain,
  fromTokenId,
  availableAmount = 0
}: DelegateProps) {
  const [delegateAddress, setDelegateAddress] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const isValidAddress = delegateAddress ? isAddress(delegateAddress) : false;

  const { address } = useAccount();
  const { delegate, isPending } = useManageMyVeION(Number(chain));
  const lpToken = getAvailableStakingToken(+chain, 'eth');

  const handleDelegate = async () => {
    if (!isValidAddress || !fromTokenId || !amount) return;

    await delegate({
      fromTokenId: fromTokenId as `0x${string}`,
      toTokenId: delegateAddress as `0x${string}`,
      lpToken: lpToken as `0x${string}`,
      amount
    });
  };

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <p>Delegate Address</p>
      <Input
        placeholder="0x..."
        onChange={(e) => setDelegateAddress(e.target.value)}
        className={!isValidAddress && delegateAddress ? 'border-red-500' : ''}
      />

      <p className="mt-2">Amount to Delegate</p>
      <Input
        type="number"
        placeholder="0.0"
        max={availableAmount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className={amount > availableAmount ? 'border-red-500' : ''}
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
        disabled={
          !isValidAddress ||
          !amount ||
          amount > availableAmount ||
          !address ||
          isPending
        }
        onClick={handleDelegate}
      >
        {isPending ? 'Delegating...' : 'Delegate veION'}
      </Button>
    </div>
  );
}
