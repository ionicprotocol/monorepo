import { useState, useEffect, useCallback } from 'react';

import { InfoIcon } from 'lucide-react';
import { formatUnits, isAddress, parseUnits } from 'viem';
import { useAccount } from 'wagmi';

import MaxDeposit from '@ui/components/MaxDeposit';
import { Button } from '@ui/components/ui/button';
import { Input } from '@ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ui/components/ui/select';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';
import { getAvailableStakingToken } from '@ui/utils/getStakingTokens';

type DelegateProps = {
  chain: string;
};

type Position = {
  id: string;
  amount: string;
  isPermanent: boolean;
};

export function Delegate({ chain }: DelegateProps) {
  const [delegateAddress, setDelegateAddress] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { selectedManagePosition } = useVeIONContext();
  const [positions, setPositions] = useState<Position[]>([]);

  const selectedPosition = positions.find((pos) => pos.id === selectedTokenId);
  const maxDelegateAmount = selectedPosition
    ? formatUnits(BigInt(selectedPosition.amount), 18)
    : '0';

  const isValidAddress = delegateAddress ? isAddress(delegateAddress) : false;
  const canDelegate = selectedManagePosition?.lockExpires.isPermanent;

  const { address } = useAccount();
  const { delegate, isPending, getOwnedTokenIds } = useVeIONManage(
    Number(chain)
  );
  const lpToken = getAvailableStakingToken(+chain, 'eth');

  const fetchTokenIds = useCallback(
    async (delegateAddress: string) => {
      if (!isValidAddress || !getOwnedTokenIds) return;

      setIsLoading(true);
      try {
        const positions = await getOwnedTokenIds(
          delegateAddress as `0x${string}`
        );
        // Filter for permanent locks only and exclude current position
        setPositions(
          positions.filter(
            (pos) => pos.id !== selectedManagePosition?.id && pos.isPermanent
          )
        );
      } catch (error) {
        console.error('Error fetching token IDs:', error);
      }
      setIsLoading(false);
    },
    [isValidAddress, getOwnedTokenIds, selectedManagePosition]
  );

  useEffect(() => {
    fetchTokenIds(delegateAddress);
  }, [delegateAddress, fetchTokenIds]);

  const handleDelegate = async () => {
    if (
      !isValidAddress ||
      !selectedManagePosition ||
      !amount ||
      !selectedTokenId
    )
      return;

    const amountBigInt = parseUnits(amount, 18);

    await delegate({
      fromTokenId: +selectedManagePosition.id,
      toTokenId: +selectedTokenId,
      lpToken: lpToken as `0x${string}`,
      amount: amountBigInt
    });
  };

  const infoMessage = !canDelegate ? (
    <div className="border border-yellow-200 text-yellow-200 text-xs flex items-center gap-3 rounded-md py-2.5 px-4">
      <InfoIcon className="h-5 w-5 flex-shrink-0" />
      <div>
        Your selected position must be a permanent lock to delegate voting
        power. Please convert your position to a permanent lock first.
      </div>
    </div>
  ) : (
    <div className="border border-yellow-200 text-yellow-200 text-xs flex items-center gap-3 rounded-md py-2.5 px-4">
      <InfoIcon className="h-5 w-5 flex-shrink-0" />
      <div className="space-y-2">
        <p>
          <strong>Requirements:</strong>
          <br />
          • Both positions must be permanent locks to delegate voting power
          <br />• The delegated voting power can be revoked at any time
        </p>
        <p>
          <strong>Important:</strong>
          <br />
          • Delegation doesn&apos;t transfer token ownership
          <br />• Even after revocation, delegates retain voting rights until
          the end of the current voting period
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-y-4 py-2 px-3">
      {!canDelegate ? (
        infoMessage
      ) : (
        <>
          <div className="space-y-2">
            <p className="text-sm font-medium">Delegate Address</p>
            <Input
              placeholder="0x..."
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
              className={
                !isValidAddress && delegateAddress ? 'border-red-500' : ''
              }
            />
          </div>

          {isValidAddress && positions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Select Token ID</p>
              <Select
                onValueChange={setSelectedTokenId}
                value={selectedTokenId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a token ID" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem
                      key={position.id}
                      value={position.id}
                    >
                      Token ID: {position.id} (
                      {formatUnits(BigInt(position.amount), 18)} veION)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isValidAddress && !isLoading && positions.length === 0 && (
            <p className="text-sm text-yellow-200">
              No permanent locks found for this address. Both positions must be
              permanent locks to delegate voting power.
            </p>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Amount to Delegate</p>
            <div className="space-y-2">
              <MaxDeposit
                headerText="Amount to Delegate"
                amount={amount}
                handleInput={(val) => setAmount(val || '0')}
                max={maxDelegateAmount}
                chain={Number(chain)}
                showUtilizationSlider
              />
            </div>
          </div>

          {infoMessage}

          <Button
            className="w-full bg-accent text-black"
            disabled={
              !canDelegate ||
              !isValidAddress ||
              !selectedTokenId ||
              !amount ||
              amount > maxDelegateAmount ||
              !address ||
              isPending ||
              isLoading
            }
            onClick={handleDelegate}
          >
            {isPending ? 'Delegating...' : 'Delegate veION'}
          </Button>
        </>
      )}
    </div>
  );
}
