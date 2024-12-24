import { useState } from 'react';

import { useVeIONContext } from '@ui/context/VeIonContext';
import { useToast } from '@ui/hooks/use-toast';
import { useVeIONDelegate } from '@ui/hooks/veion/useVeIONDelegate';

import TimeRemaining from './TimeRemaining';
import CommonTable from '../CommonTable';
import { TableActionButton } from '../TableActionButton';
import TokenPair from '../TokenPair';

import type { EnhancedColumnDef, MarketCellProps } from '../CommonTable';

// Types
type BaseVeionData = {
  id: string;
  tokensLocked: string;
  lockedBLP: {
    amount: string;
    value: string;
  };
  lockExpires: {
    date: string;
    timeLeft: string;
  };
  votingPower: string;
};

type DelegateVeionData = BaseVeionData & {
  delegatedTo: string;
  readyToDelegate: boolean;
  chainId: number;
  lpTokenAddress: string;
  delegatedTokenIds: number[];
  delegatedAmounts: string[];
};

interface DelegateVeionTableProps {
  data: DelegateVeionData[];
  onUndelegateSuccess?: () => void;
}

function DelegateVeionTable({
  data,
  onUndelegateSuccess
}: DelegateVeionTableProps) {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const {
    locks: { delegatedLocks, isLoading }
  } = useVeIONContext();
  // eslint-disable-next-line no-console
  console.log('isLoading', isLoading);
  // eslint-disable-next-line no-console
  console.log('delegatedLocks', delegatedLocks);

  const defaultChain = data[0]?.chainId ?? 1;
  const { undelegate, isUndelegating } = useVeIONDelegate(defaultChain);

  const handleUndelegate = async (row: DelegateVeionData) => {
    try {
      setProcessingId(row.id);

      const success = await undelegate({
        fromTokenId: parseInt(row.id),
        toTokenIds: row.delegatedTokenIds,
        lpToken: row.lpTokenAddress as `0x${string}`,
        amounts: row.delegatedAmounts
      });

      if (success) {
        toast({
          title: 'Success',
          description: 'Successfully undelegated tokens'
        });
        onUndelegateSuccess?.();
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to undelegate tokens',
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEEAD',
      '#D4A5A5',
      '#9B59B6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Delegate VeION Table Configuration
  const delegateVeionColumns: EnhancedColumnDef<DelegateVeionData>[] = [
    {
      id: 'id',
      header: <div className="pl-6">ID</div>,
      sortingFn: 'numerical',
      cell: ({ row }: MarketCellProps) => (
        <div className="flex items-center gap-2 pl-6">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getRandomColor() }}
          />
          <div className="text-xs font-semibold text-white/80">
            {row.getValue('id')}
          </div>
        </div>
      )
    },
    {
      id: 'tokensLocked',
      header: 'TOKENS LOCKED',
      sortingFn: 'numerical',
      cell: ({ row }: MarketCellProps) => (
        <div className="flex items-center gap-3">
          <TokenPair
            token1="ion"
            token2="eth"
            size={24}
          />
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-white/80">
              {row.getValue('tokensLocked')}
            </div>
            <div className="text-xs font-semibold text-white/40">
              Balancer LP
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'lockedBLPAmount',
      accessorFn: (row: DelegateVeionData) => row.lockedBLP.amount,
      header: 'LP',
      sortingFn: 'numerical',
      cell: ({ row }: MarketCellProps) => (
        <div className="flex flex-col items-start">
          <div className="text-xs font-semibold text-white/80">
            {row.original.lockedBLP.amount}
          </div>
          <div className="text-xs font-semibold text-white/40">$400.32</div>
        </div>
      )
    },
    {
      id: 'lockExpiresDate',
      accessorFn: (row: DelegateVeionData) => row.lockExpires.date,
      header: 'LOCK EXPIRES',
      cell: ({ row }: MarketCellProps) => (
        <TimeRemaining lockExpiryDate={row.original.lockExpires.date} />
      )
    },
    {
      id: 'votingPower',
      header: 'VOTING POWER',
      sortingFn: 'numerical',
      cell: ({ row }: MarketCellProps) => (
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-white/80">
            {row.getValue('votingPower')}
          </div>
          <div className="text-xs font-semibold text-white/40">
            1.67% of all
          </div>
        </div>
      )
    },
    {
      id: 'delegatedTo',
      header: 'DELEGATED TO',
      sortingFn: 'alphabetical',
      cell: ({ row }: MarketCellProps) => (
        <div className="text-xs font-semibold text-white/80 pl-6">
          {row.getValue('delegatedTo') || '-'}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }: MarketCellProps) => {
        const data = row.original;
        const isProcessing = processingId === data.id;

        return (
          <div className="flex justify-end pr-6">
            {data.readyToDelegate ? (
              <TableActionButton
                width="100px"
                onClick={() => handleUndelegate(data)}
                disabled={isProcessing || isUndelegating}
              >
                {isProcessing ? 'Undelegating...' : 'Undelegate'}
              </TableActionButton>
            ) : (
              <TableActionButton
                variant="secondary"
                width="100px"
                disabled
              >
                {data.lockExpires.timeLeft}
              </TableActionButton>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div>
      <CommonTable
        data={data}
        columns={delegateVeionColumns}
        isLoading={false}
      />
    </div>
  );
}

export default DelegateVeionTable;
