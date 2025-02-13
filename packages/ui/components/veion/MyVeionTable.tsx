import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useSwitchChain } from 'wagmi';

import ActionButton from '@ui/components/ActionButton';
import CommonTable from '@ui/components/CommonTable';
import type {
  EnhancedColumnDef,
  MarketCellProps
} from '@ui/components/CommonTable';
import TokenPair from '@ui/components/TokenPair';
import { useVeIONContext } from '@ui/context/VeIonContext';
import type { MyVeionData } from '@ui/types/veION';

import ExtendVeion from './ExtendVeion';
import ManageDialog from './ManageDialog';
import PositionTitle from './PositionTitle';
import TimeRemaining from './TimeRemaining';
import VeionClaim from './VeionClaim';
import { getBgColor, getTextColor } from '../DynamicSubNav';
import { Badge } from '../ui/badge';
import { pools } from '@ui/constants';

function MyVeionTable() {
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const { switchChain } = useSwitchChain();

  const router = useRouter();
  const {
    setSelectedManagePosition,
    locks: { myLocks, isLoading }
  } = useVeIONContext();

  const hasLockExpired = (lockExpiryDate: string, isPermanent: boolean) => {
    if (isPermanent) return false;
    return new Date(lockExpiryDate).getTime() < Date.now();
  };

  const myVeionColumns: EnhancedColumnDef<MyVeionData>[] = [
    {
      id: 'id',
      header: <div className="pl-6">ID</div>,
      sortingFn: 'numerical',
      cell: ({ row }: MarketCellProps) => (
        <div className="pl-6">
          <PositionTitle
            chainId={row.original.chainId}
            position={row.original.id}
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
            token2={row.original.chainId === 34443 ? 'mode' : 'eth'}
            size={24}
          />
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-white/80">
              {row.getValue('tokensLocked')}
            </div>
            <div className="text-xs font-semibold text-white/40">
              {row.original.chainId === 34443 ? 'Velodrome LP' : 'Aerodrome LP'}
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
          <div className="text-xs font-semibold text-white/40">
            $
            {row.original.lockedBLP.value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 3
            })}
          </div>
        </div>
      )
    },
    {
      id: 'lockExpiresDate',
      accessorFn: (row: MyVeionData) => row.lockExpires.date,
      header: 'LOCK EXPIRES',
      cell: ({ row }: MarketCellProps) =>
        row.original.lockExpires.isPermanent ? (
          <Badge className="text-xs font-medium">Permanent</Badge>
        ) : (
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
            {row.original.votingPower.toFixed(5)} veION (
            {row.original.votingBoost.toFixed(2)}x)
          </div>
          <div className="text-xs font-semibold text-white/40">
            {row.original.votingPercentage.toFixed(6)} %
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
        const isExpired = hasLockExpired(
          data.lockExpires.date,
          data.lockExpires.isPermanent
        );

        return (
          <div className="flex gap-2 w-full">
            {/* {isExpired ? (
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
            ) : ( */}
            <>
              <ActionButton
                half
                action={() => {
                  setSelectedManagePosition(data);
                  setIsManageOpen(true);
                }}
                label="Manage"
                bg="bg-white/10"
                className={`${getBgColor('', data.chainId)} ${getTextColor(
                  '',
                  data.chainId
                )}`}
              />
              <ActionButton
                half
                action={() => {
                  switchChain({
                    chainId: data.chainId
                  });
                  router.push(
                    `/veion/governance/vote?chain=${data.chainId}&id=${data.id}`
                  );
                }}
                label="Vote"
                bg="bg-white/10"
                className="bg-accent"
              />
            </>
            {/* )} */}
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
        hidePR={false}
        data={myLocks}
        columns={myVeionColumns}
        isLoading={isLoading}
        getRowStyle={(row) => ({
          badge: row.original.votingStatus.hasVoted
            ? { text: 'Voted' }
            : undefined,
          borderClassName: row.original.votingStatus.hasVoted
            ? pools[row.original.chainId]?.border
            : undefined
        })}
      />
    </div>
  );
}

export default MyVeionTable;
