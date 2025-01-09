import { useState } from 'react';

import { useRouter } from 'next/navigation';

import ActionButton from '@ui/components/ActionButton';
import CommonTable from '@ui/components/CommonTable';
import type {
  EnhancedColumnDef,
  MarketCellProps
} from '@ui/components/CommonTable';
import TokenPair from '@ui/components/TokenPair';
import { useVeIONContext } from '@ui/context/VeIonContext';

import ExtendVeion from './ExtendVeion';
import ManageDialog from './ManageDialog';
import PositionTitle from './PositionTitle';
import TimeRemaining from './TimeRemaining';
import VeionClaim from './VeionClaim';

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
  chainId: number;
  position?: number;
};

type MyVeionData = BaseVeionData & {
  enableClaim?: boolean;
};

interface MyVeionTableProps {
  data: MyVeionData[];
}

function MyVeionTable({ data }: MyVeionTableProps) {
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);

  const router = useRouter();
  const {
    locks: { myLocks, isLoading }
  } = useVeIONContext();
  // eslint-disable-next-line no-console
  console.log('isLoading', isLoading);
  // eslint-disable-next-line no-console
  console.log('myLocks', myLocks);

  const myVeionColumns: EnhancedColumnDef<MyVeionData>[] = [
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
      accessorFn: (row: MyVeionData) => row.lockedBLP.amount,
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
      accessorFn: (row: MyVeionData) => row.lockExpires.date,
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
      id: 'actions',
      header: 'ACTIONS',
      enableSorting: false,
      cell: ({ row }: MarketCellProps) => {
        const data = row.original;

        return (
          <div className="flex gap-2 w-full pr-6">
            {data.enableClaim ? (
              <>
                <ActionButton
                  half
                  action={() => setIsClaimOpen(true)}
                  label="Claim LP"
                />
                <ActionButton
                  half
                  action={() => setIsExtendOpen(true)}
                  label="Extend"
                />
              </>
            ) : (
              <>
                <ActionButton
                  half
                  action={() =>
                    router.push(
                      `/veion/governance/vote?chain=${data.chainId}&id=${data.id}`
                    )
                  }
                  label="Vote"
                  bg="bg-white/10"
                  className="text-white"
                />
                <ActionButton
                  half
                  action={() => setIsManageOpen(true)}
                  label="Manage"
                  bg="bg-white/10"
                  className="text-white"
                />
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div>
      {/* Modals */}
      <VeionClaim
        isOpen={isClaimOpen}
        onOpenChange={setIsClaimOpen}
        lpAmount="100"
        tokenId={1}
        tokenAddress="0x123"
      />
      <ExtendVeion
        isOpen={isExtendOpen}
        onOpenChange={setIsExtendOpen}
        maxToken={1000}
        tokenId={1}
        tokenAddress="0x123"
      />
      <ManageDialog
        isOpen={isManageOpen}
        onOpenChange={setIsManageOpen}
      />

      <CommonTable
        data={data}
        columns={myVeionColumns}
        isLoading={false}
        hidePR
      />
    </div>
  );
}

export default MyVeionTable;
