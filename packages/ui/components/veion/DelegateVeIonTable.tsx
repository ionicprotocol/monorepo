import { useState } from 'react';

import ActionButton from '@ui/components/ActionButton';
import CommonTable from '@ui/components/CommonTable';
import type {
  EnhancedColumnDef,
  MarketCellProps
} from '@ui/components/CommonTable';
import TokenPair from '@ui/components/TokenPair';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useToast } from '@ui/hooks/use-toast';
import type { DelegateVeionData } from '@ui/types/veION';

import { DelegatedToCell } from './DelegatedToCell';
import PositionTitle from './PositionTitle';

interface DelegateVeionTableProps {
  onUndelegateSuccess?: () => void;
}

function DelegateVeionTable({ onUndelegateSuccess }: DelegateVeionTableProps) {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const {
    locks: { delegatedLocks, isLoading }
  } = useVeIONContext();

  const delegateVeionColumns: EnhancedColumnDef<DelegateVeionData>[] = [
    {
      id: 'id',
      header: <div className="pl-6">ID</div>,
      sortingFn: 'numerical',
      cell: ({ row }: MarketCellProps) => (
        <div className="pl-6">
          <PositionTitle
            chainId={row.original.chainId}
            position={row.original.position}
          />
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
          <div className="text-xs font-semibold text-white/40">
            $
            {row.original.lockedBLP.value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 7
            })}
          </div>
        </div>
      )
    },
    {
      id: 'votingPower',
      header: 'VOTING POWER',
      sortingFn: 'numerical',
      cell: ({ row }: MarketCellProps) => (
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-white/80">
            {row.original.votingPower.toFixed(5)} veION (
            {row.original.votingBoost.toFixed(2)}x)
          </div>
          <div className="text-xs font-semibold text-white/40">
            {row.original.votingPercentage.toFixed(3)} %
          </div>
        </div>
      )
    },
    {
      id: 'delegatedTo',
      header: 'DELEGATED TO',
      sortingFn: 'alphabetical',
      cell: DelegatedToCell
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      enableSorting: false,
      cell: ({ row }: MarketCellProps) => {
        const data = row.original;
        const isProcessing = processingId === data.id;

        return (
          <div className="flex gap-2 w-full pr-6">
            <ActionButton
              half={false}
              action={() => {}}
              disabled={isProcessing}
              label={isProcessing ? 'Undelegating...' : 'Undelegate'}
            />
          </div>
        );
      }
    }
  ];

  return (
    <div>
      <CommonTable
        data={delegatedLocks}
        columns={delegateVeionColumns}
        isLoading={isLoading}
      />
    </div>
  );
}

export default DelegateVeionTable;
