'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { mode } from 'viem/chains';
import { Checkbox } from '@ui/components/ui/checkbox';
import {
  useEmissionsContext,
  VoteMarketRow
} from '@ui/context/EmissionsManagementContext';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useToast } from '@ui/hooks/use-toast';
import { MarketSide, useVeIONVote } from '@ui/hooks/veion/useVeIONVote';
import EmissionsManagementFooter from './EmissionsManagementFooter';
import VoteInput from './VoteInput';
import CommonTable from '../CommonTable';
import PoolToggle from '../markets/PoolToggle';
import type { EnhancedColumnDef } from '../CommonTable';
import SearchInput from '../markets/SearcInput';
import { CopyButton } from '../CopyButton';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@ui/components/ui/select';
import TokenBalance from '../markets/Cells/TokenBalance';

interface EmissionsManagementTableProps {
  tokenId: number;
  showPendingOnly: boolean;
}

type AssetTypeFilter = 'all' | 'supply' | 'borrow';

function EmissionsManagement({
  tokenId,
  showPendingOnly
}: EmissionsManagementTableProps) {
  const { currentChain } = useVeIONContext();
  const { marketRows, isLoading, error } = useEmissionsContext();
  const { toast } = useToast();
  const { submitVote, isVoting } = useVeIONVote(currentChain);
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();
  const [assetTypeFilter, setAssetTypeFilter] =
    useState<AssetTypeFilter>('all');

  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();

  const filteredVotingData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return marketRows.filter((row) => {
      // Filter by asset type
      if (assetTypeFilter === 'supply' && row.side !== MarketSide.Supply) {
        return false;
      }
      if (assetTypeFilter === 'borrow' && row.side !== MarketSide.Borrow) {
        return false;
      }

      // Filter for pending votes if showPendingOnly is true
      if (showPendingOnly && row.voteValue !== '') {
        return false;
      }

      // Filter based on searchTerm
      if (term) {
        return (
          row.asset.toLowerCase().includes(term) ||
          row.marketAddress.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [marketRows, showPendingOnly, searchTerm, assetTypeFilter]);

  const columns = useMemo<EnhancedColumnDef<VoteMarketRow>[]>(
    () => [
      {
        id: 'asset',
        header: 'ASSET',
        sortingFn: 'alphabetical',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Image
              src={`/img/symbols/32/color/${row.original.asset.toLowerCase()}.png`}
              alt={row.original.asset}
              width={24}
              height={24}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/80">
                  {row.original.asset}
                </span>
                <CopyButton
                  value={row.original.underlyingToken}
                  message={`${row.original.asset} token address copied to clipboard`}
                  tooltipMessage="Copy token address"
                />
              </div>
              <span className="text-xs text-white/60">
                {row.original.side === MarketSide.Supply ? 'Supply' : 'Borrow'}:{' '}
                {row.original.currentAmount}
              </span>
            </div>
          </div>
        )
      },
      {
        id: 'currentMarketAPR',
        header: 'CURRENT MARKET APR',
        sortingFn: 'numerical',
        cell: ({ row }) => <span>{row.original.currentMarketAPR}</span>
      },
      {
        id: 'projectedMarketAPR',
        header: 'PROJECTED MARKET APR',
        sortingFn: 'numerical',
        cell: ({ row }) => <span>{row.original.projectedMarketAPR}</span>
      },
      {
        id: 'incentives',
        header: 'INCENTIVES',
        sortingFn: 'numerical',
        cell: ({ row }) => (
          <TokenBalance
            balance={row.original.incentives.balance}
            balanceUSD={row.original.incentives.balanceUSD}
            tokenName={row.original.asset}
          />
        )
      },
      {
        id: 'veAPR',
        header: 'veAPR',
        sortingFn: 'numerical',
        cell: ({ row }) => <span>{row.original.veAPR}</span>
      },
      {
        id: 'totalVotes',
        header: 'TOTAL VOTES',
        sortingFn: 'numerical',
        cell: ({ row }) => {
          const totalVotes = row.original.totalVotes;
          return (
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-white/80">
                {totalVotes.percentage}
              </div>
              <div className="text-xs font-semibold text-white/40">
                {totalVotes.limit}
              </div>
            </div>
          );
        }
      },
      {
        id: 'myVotes',
        header: 'MY VOTES',
        sortingFn: 'numerical',
        cell: ({ row }) => {
          const myVotes = row.original.myVotes;
          return (
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-white/80">
                {myVotes.percentage}
              </div>
              <div className="text-xs font-semibold text-white/40">
                {myVotes.value}
              </div>
            </div>
          );
        }
      },
      {
        id: 'vote',
        header: 'VOTE',
        cell: ({ row }) => (
          <VoteInput
            marketAddress={row.original.marketAddress}
            side={row.original.side}
            isDisabled={isVoting}
          />
        )
      }
    ],
    [isVoting]
  );

  const handleSubmitVotes = async () => {
    try {
      const success = await submitVote(tokenId);

      if (success) {
        toast({
          title: 'Success',
          description: 'Votes submitted successfully'
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="text-red-500">Error loading data: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="relative pb-12">
      <div className="w-full flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex justify-center sm:justify-end sm:flex-shrink-0">
          <PoolToggle
            chain={+chain}
            pool={selectedPool}
          />
        </div>
        <Select
          value={assetTypeFilter}
          onValueChange={(value: AssetTypeFilter) => setAssetTypeFilter(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Show all</SelectItem>
            <SelectItem value="supply">Supply</SelectItem>
            <SelectItem value="borrow">Borrow</SelectItem>
          </SelectContent>
        </Select>
        <div className="w-full">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={`Search by ${
              selectedPool === 'vault'
                ? 'vault name, token, or strategy'
                : 'token or address'
            }...`}
          />
        </div>
      </div>

      <CommonTable
        columns={columns}
        data={filteredVotingData}
        isLoading={isLoading}
        hidePR
      />

      <EmissionsManagementFooter
        onSubmitVotes={handleSubmitVotes}
        isVoting={isVoting}
      />
    </div>
  );
}

export default EmissionsManagement;
