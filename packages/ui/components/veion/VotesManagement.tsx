import React, { useMemo, useState } from 'react';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { Portal } from '@radix-ui/react-portal';
import { mode } from 'viem/chains';

import CommonTable from '@ui/components/CommonTable';
import type { EnhancedColumnDef } from '@ui/components/CommonTable';
import { CopyButton } from '@ui/components/CopyButton';
import APR from '@ui/components/markets/Cells/APR';
import PoolToggle from '@ui/components/markets/PoolToggle';
import SearchInput from '@ui/components/markets/SearcInput';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@ui/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@ui/components/ui/tooltip';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIonVoteContext } from '@ui/context/VeIonVoteContext';
import { useVotes } from '@ui/context/VotesContext';
import { useVeIONVote } from '@ui/hooks/veion/useVeIONVote';
import type { VoteMarketRow } from '@ui/types/veION';
import { MarketSide } from '@ui/types/veION';

import VoteInput from './VoteInput';
import VotesManagementFooter from './VotesManagementFooter';
import BalanceBreakdown from '../markets/Cells/BalanceBreakdown';

interface HiddenPool {
  chainId: number;
  poolId: string;
}

interface VotesManagementTableProps {
  tokenId: number;
  showPendingOnly: boolean;
}

type AssetTypeFilter = 'all' | 'borrow' | 'supply';

const TooltipWrapper = ({
  children,
  content
}: {
  children: React.ReactNode;
  content: string;
}) => (
  <Tooltip delayDuration={300}>
    <TooltipTrigger asChild>
      <div className="cursor-help">{children}</div>
    </TooltipTrigger>
    <Portal>
      <TooltipContent className="max-w-xs">
        <p>{content}</p>
      </TooltipContent>
    </Portal>
  </Tooltip>
);

function VotesManagement({
  tokenId,
  showPendingOnly
}: VotesManagementTableProps) {
  const { currentChain } = useVeIONContext();
  const { selectedPoolRows: marketRows, votingPeriod } = useVeIonVoteContext();
  const { votes } = useVotes();
  const { isVoting } = useVeIONVote(currentChain);
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();
  const [assetTypeFilter, setAssetTypeFilter] =
    useState<AssetTypeFilter>('all');

  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const chain = querychain ? querychain : mode.id.toString();
  const selectedPool = +chain === mode.id ? '1' : querypool ?? '0';

  const hiddenPools: HiddenPool[] = [{ chainId: mode.id, poolId: '0' }];

  const isHiddenPool = useMemo(() => {
    return hiddenPools.some(
      (hiddenPool) =>
        hiddenPool.chainId === +chain && hiddenPool.poolId === selectedPool
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, selectedPool]);

  const filteredVotingData = useMemo(() => {
    if (isHiddenPool) {
      return [];
    }

    const term = searchTerm.trim().toLowerCase();

    return marketRows.data.filter((row) => {
      if (assetTypeFilter === 'supply' && row.side !== MarketSide.Supply) {
        return false;
      }
      if (assetTypeFilter === 'borrow' && row.side !== MarketSide.Borrow) {
        return false;
      }
      const key = `${row.marketAddress}-${row.side === MarketSide.Supply ? 'supply' : 'borrow'}`;
      if (showPendingOnly && votes[key]) {
        return false;
      }
      if (term) {
        return (
          row.asset.toLowerCase().includes(term) ||
          row.marketAddress.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [
    isHiddenPool,
    searchTerm,
    marketRows.data,
    assetTypeFilter,
    showPendingOnly,
    votes
  ]);

  const votingWarning = useMemo(() => {
    if (votingPeriod.hasVoted && votingPeriod.nextVotingDate) {
      return (
        <div className="w-full p-4 mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-500 text-sm">
            You have already voted this epoch. Votes can only be submitted once
            per epoch. Next voting period starts{' '}
            {votingPeriod.nextVotingDate.toLocaleDateString()} at{' '}
            {votingPeriod.nextVotingDate.toLocaleTimeString()}.
          </p>
        </div>
      );
    }
    return null;
  }, [votingPeriod.hasVoted, votingPeriod.nextVotingDate]);

  const baseColumns: EnhancedColumnDef<VoteMarketRow>[] = [
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
                {row.original.asset}{' '}
                {row.original.side === MarketSide.Supply ? 'Supply' : 'Borrow'}
              </span>
              <CopyButton
                value={row.original.underlyingToken}
                message={`${row.original.asset} token address copied to clipboard`}
                tooltipMessage="Copy token address"
              />
            </div>
            <span className="text-xs text-white/40 font-light">
              Total{' '}
              {row.original.side === MarketSide.Supply ? 'Supply' : 'Borrow'}:{' '}
              {row.original.currentAmount} $
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'aprTotal',
      header: (
        <TooltipWrapper content="Current market APR including underlying asset APR">
          <span>CURRENT APR</span>
        </TooltipWrapper>
      ),
      sortingFn: 'numerical',
      accessorFn: (row) =>
        row.side === MarketSide.Supply
          ? row.apr.supplyAPRTotal
          : row.apr.borrowAPRTotal,
      cell: ({ row }) => (
        <APR
          type={row.original.side === MarketSide.Supply ? 'supply' : 'borrow'}
          baseAPR={
            (row.original.side === MarketSide.Supply
              ? row.original.apr.supplyAPR
              : row.original.apr.borrowAPR) ?? 0
          }
          noRewards
          disabled
          asset={row.original.asset}
          dropdownSelectedChain={+chain}
          selectedPoolId={selectedPool}
          cToken={row.original.apr.cTokenAddress}
          pool={row.original.apr.comptrollerAddress}
          nativeAssetYield={row.original.apr.nativeAssetYield}
          underlyingToken={row.original.underlyingToken}
          aprTotal={
            row.original.side === MarketSide.Supply
              ? row.original.apr.supplyAPRTotal
              : row.original.apr.borrowAPRTotal
          }
        />
      )
    },
    {
      id: 'incentives',
      accessorFn: (row) => row.incentives.balanceUSD,
      header: (
        <TooltipWrapper content="Incentives allocated for voters">
          <span>INCENTIVES</span>
        </TooltipWrapper>
      ),
      sortingFn: 'numerical',
      cell: ({ row }) => (
        <BalanceBreakdown
          balanceUSD={row.original.incentives.balanceUSD}
          tokens={row.original.incentives.tokens}
        />
      )
    },
    {
      id: 'veAPR',
      accessorFn: (row) => row.veAPR,
      header: (
        <TooltipWrapper content="Current voting APR">
          <span>veAPR</span>
        </TooltipWrapper>
      ),
      sortingFn: 'numerical',
      cell: ({ row }) => <span>{row.original.veAPR.toFixed(2)}</span>
    },
    {
      id: 'totalVotes.limit',
      header: (
        <TooltipWrapper content="Current votes distribution breakdown">
          <span>TOTAL VOTES</span>
        </TooltipWrapper>
      ),
      accessorFn: (row) => row.totalVotes.limit,
      sortingFn: 'numerical',
      cell: ({ row }) => {
        const totalVotes = row.original.totalVotes;
        return (
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-white/80">
              {totalVotes.limit.toFixed(2)}
            </div>
            <div className="text-xs font-semibold text-white/40">
              {totalVotes.percentage.toFixed(2)}%
            </div>
          </div>
        );
      }
    },
    {
      id: 'myVotes.value',
      header: (
        <TooltipWrapper content="Your vote distribution breakdown">
          <span>MY VOTES</span>
        </TooltipWrapper>
      ),
      sortingFn: 'numerical',
      accessorFn: (row) => row.myVotes.value,
      cell: ({ row }) => {
        const myVotes = row.original.myVotes;
        return (
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-white/80">
              {myVotes.value.toFixed(2)}
            </div>
            <div className="text-xs font-semibold text-white/40">
              {myVotes.percentage.toFixed(2)}%
            </div>
          </div>
        );
      }
    }
  ];

  const columns = useMemo<EnhancedColumnDef<VoteMarketRow>[]>(() => {
    const columnsWithOptionalVoting = [...baseColumns];

    if (!votingPeriod.isVotingClosed && !votingPeriod.hasVoted) {
      columnsWithOptionalVoting.push({
        id: 'vote',
        header: 'VOTE (%)',
        cell: ({ row }) => (
          <VoteInput
            marketAddress={row.original.marketAddress}
            side={row.original.side}
            isDisabled={isVoting}
          />
        )
      });
    }

    return columnsWithOptionalVoting;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votingPeriod.hasVoted, votingPeriod.isVotingClosed, isVoting]);

  return (
    <div className="relative pb-12">
      {votingWarning}
      <div className="w-full flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex justify-center sm:justify-end sm:flex-shrink-0">
          <PoolToggle
            chain={+chain}
            pool={selectedPool}
            hiddenPools={hiddenPools}
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
            placeholder="Search by token or address..."
          />
        </div>
      </div>

      <CommonTable
        columns={columns}
        data={filteredVotingData}
        isLoading={marketRows.isLoading}
      />

      {!votingPeriod.hasVoted && <VotesManagementFooter tokenId={tokenId} />}
    </div>
  );
}

export default VotesManagement;
