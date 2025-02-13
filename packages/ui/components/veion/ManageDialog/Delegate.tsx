import { useState, useEffect, useCallback, useRef } from 'react';

import { debounce } from 'lodash';
import { InfoIcon, LockIcon } from 'lucide-react';
import { formatUnits, isAddress, parseUnits } from 'viem';
import { useAccount } from 'wagmi';

import MaxDeposit from '@ui/components/MaxDeposit';
import TransactionButton from '@ui/components/TransactionButton';
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

type Position = {
  id: string;
  amount: string;
  isPermanent: boolean;
};

export function Delegate() {
  const [delegateAddress, setDelegateAddress] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);

  const { selectedManagePosition } = useVeIONContext();
  const chain = Number(selectedManagePosition?.chainId);
  const { address } = useAccount();
  const { handleDelegate, handleLockPermanent, getOwnedTokenIds } =
    useVeIONManage(Number(chain));

  const selectedPosition = positions.find((pos) => pos.id === selectedTokenId);
  const maxDelegateAmount = selectedManagePosition
    ? formatUnits(BigInt(selectedManagePosition.lockedBLP.rawAmount), 18)
    : '0';

  const isValidAddress = delegateAddress ? isAddress(delegateAddress) : false;
  const canDelegate = selectedManagePosition?.lockExpires.isPermanent;

  const fetchTokenIds = useCallback(
    async (delegateAddress: string) => {
      if (!isAddress(delegateAddress) || !getOwnedTokenIds) return;

      setIsLoading(true);
      try {
        const positions = await getOwnedTokenIds(
          delegateAddress as `0x${string}`
        );

        setPositions(
          positions.filter((pos) => pos.id !== selectedManagePosition?.id)
        );
      } catch (error) {
        console.error('Error fetching token IDs:', error);
      }
      setIsLoading(false);
    },
    [getOwnedTokenIds, selectedManagePosition]
  );

  const debouncedFetchTokenIds = useRef(
    debounce((address: string) => {
      if (isAddress(address)) {
        fetchTokenIds(address);
      }
    }, 500)
  ).current;

  useEffect(() => {
    debouncedFetchTokenIds(delegateAddress);
    return () => {
      debouncedFetchTokenIds.cancel();
    };
  }, [delegateAddress, debouncedFetchTokenIds]);

  const onDelegate = async () => {
    if (
      !isValidAddress ||
      !selectedManagePosition ||
      !amount ||
      !selectedTokenId
    ) {
      return { success: false };
    }

    const amountBigInt = parseUnits(amount, 18);
    const success = await handleDelegate({
      toTokenId: +selectedTokenId,
      amount: amountBigInt
    });

    if (success) {
      setAmount('');
      setSelectedTokenId('');
    }

    return { success };
  };

  const onLockSourcePosition = async () => {
    if (!selectedManagePosition) {
      return { success: false };
    }
    const success = await handleLockPermanent();
    return { success };
  };

  const isDisabled =
    !canDelegate ||
    !isValidAddress ||
    !selectedTokenId ||
    !amount ||
    !selectedPosition?.isPermanent ||
    Number(amount) > Number(maxDelegateAmount) ||
    !address ||
    isLoading;

  return (
    <div className="flex flex-col gap-y-4 py-2 px-3">
      {!canDelegate ? (
        <div className="space-y-4">
          <div className="border border-yellow-200 text-yellow-200 text-xs flex items-center gap-3 rounded-md py-2.5 px-4">
            <InfoIcon className="h-5 w-5 flex-shrink-0" />
            <div>
              Your selected position must be a permanent lock to delegate voting
              power. Please convert your position to a permanent lock first.
            </div>
          </div>
          <TransactionButton
            onSubmit={onLockSourcePosition}
            buttonText={`Lock Position #${selectedManagePosition?.id}`}
            isDisabled={!address}
          />
        </div>
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
                      className="hover:cursor-pointer hover:bg-gray-800"
                    >
                      Token ID: {position.id} (
                      {formatUnits(BigInt(position.amount), 18)} veION)
                      {position.isPermanent && (
                        <LockIcon className="h-4 w-4 ml-2 inline-block text-yellow-200" />
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isValidAddress && !isLoading && positions.length === 0 && (
            <p className="text-sm text-yellow-200">
              No positions found for this address.
            </p>
          )}

          <div className="space-y-2">
            <MaxDeposit
              headerText="Amount to Delegate"
              amount={amount}
              handleInput={(val) => setAmount(val || '0')}
              tokenName="veion"
              max={maxDelegateAmount}
              chain={Number(chain)}
              showUtilizationSlider
            />
          </div>

          <div className="border border-yellow-200 text-yellow-200 text-xs flex items-center gap-3 rounded-md py-2.5 px-4">
            <InfoIcon className="h-5 w-5 flex-shrink-0" />
            <div className="space-y-2">
              <p>
                <strong>Requirements:</strong>
                <br />
                • Both positions must be permanent locks to delegate voting
                power
                <br />• The delegated voting power can be revoked at any time
              </p>
              <p>
                <strong>Important:</strong>
                <br />
                • Delegation doesn&apos;t transfer token ownership
                <br />• Even after revocation, delegates retain voting rights
                until the end of the current voting period
              </p>
            </div>
          </div>

          <TransactionButton
            onSubmit={onDelegate}
            isDisabled={isDisabled}
            buttonText="Delegate veION"
            targetChainId={chain}
          />
        </>
      )}
    </div>
  );
}
