import { useState } from 'react';

import { useVeIONContext } from '@ui/context/VeIonContext';
import { useToast } from '@ui/hooks/use-toast';
import { useVeIONDelegate } from '@ui/hooks/veion/useVeIONDelegate';

import TimeRemaining from './TimeRemaining';
import CommonTable from '../CommonTable';
import { TableActionButton } from '../TableActionButton';
import TokenPair from '../TokenPair';

import type { ColumnDef } from '@tanstack/react-table';

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

  const columns: ColumnDef<DelegateVeionData>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
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
      accessorKey: 'tokensLocked',
      header: 'TOKENS LOCKED',
      cell: ({ row }) => (
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
      accessorKey: 'lockedBLP.amount',
      header: 'LP',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-white/80">
            {row.original.lockedBLP.amount}
          </div>
          <div className="text-xs font-semibold text-white/40">$400.32</div>
        </div>
      )
    },
    {
      accessorKey: 'lockExpires.date',
      header: 'LOCK EXPIRES',
      cell: ({ row }) => (
        <TimeRemaining lockExpiryDate={row.original.lockExpires.date} />
      )
    },
    {
      accessorKey: 'votingPower',
      header: 'VOTING POWER',
      cell: ({ row }) => (
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
      accessorKey: 'delegatedTo',
      header: 'DELEGATED TO',
      cell: ({ row }) => (
        <div className="text-xs font-semibold text-white/80">
          {row.getValue('delegatedTo') || '-'}
        </div>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const data = row.original;
        const isProcessing = processingId === data.id;

        return (
          <div className="flex justify-end">
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
        columns={columns}
        isLoading={false}
      />
    </div>
  );
}

export default DelegateVeionTable;
