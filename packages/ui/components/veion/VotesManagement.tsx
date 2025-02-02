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
import { useVoteTableData, useVotes } from '@ui/context/VotesContext';
import { useVeIONVote } from '@ui/hooks/veion/useVeIONVote';
import type { VoteMarketRow } from '@ui/types/veION';
import { MarketSide } from '@ui/types/veION';

import VoteInput from './VoteInput';
import VotesManagementFooter from './VotesManagementFooter';
import BalanceBreakdown from '../markets/Cells/BalanceBreakdown';

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
  const { marketRows, isLoading, error } = useVoteTableData();
  console.log('marketRows', marketRows);
  const { votes } = useVotes();
  console.log('votes', votes);
  const { isVoting } = useVeIONVote(currentChain);
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
  }, [marketRows, showPendingOnly, searchTerm, assetTypeFilter, votes]);

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
        id: 'aprTotal',
        header: (
          <TooltipWrapper content="Current market APR including underlying asset APR">
            <span>CURRENT APR</span>
          </TooltipWrapper>
        ),
        sortingFn: 'numerical',
        cell: ({ row }) => (
          <APR
            type={row.original.side === MarketSide.Supply ? 'supply' : 'borrow'}
            baseAPR={
              (row.original.side === MarketSide.Supply
                ? row.original.apr.supplyAPR
                : row.original.apr.borrowAPR) ?? 0
            }
            asset={row.original.asset}
            rewards={
              row.original.side === MarketSide.Supply
                ? row.original.apr.supplyRewards
                : row.original.apr.borrowRewards
            }
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
        header: (
          <TooltipWrapper content="Vote incentives allocated for the voter to the specific market and side">
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
        header: (
          <TooltipWrapper content="Current voting APR considering votes distribution as of this moment">
            <span>veAPR</span>
          </TooltipWrapper>
        ),
        sortingFn: 'numerical',
        cell: ({ row }) => <span>{row.original.veAPR}</span>
      },
      {
        id: 'totalVotes',
        header: (
          <TooltipWrapper content="Current votes distribution breakdown">
            <span>TOTAL VOTES</span>
          </TooltipWrapper>
        ),
        sortingFn: 'numerical',
        cell: ({ row }) => {
          const totalVotes = row.original.totalVotes;
          return (
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-white/80">
                {totalVotes.limit}
              </div>
              <div className="text-xs font-semibold text-white/40">
                {totalVotes.percentage}
              </div>
            </div>
          );
        }
      },
      {
        id: 'myVotes',
        header: (
          <TooltipWrapper content="Your vote distribution breakdown">
            <span>MY VOTES</span>
          </TooltipWrapper>
        ),
        sortingFn: 'numerical',
        cell: ({ row }) => {
          const myVotes = row.original.myVotes;
          return (
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-white/80">
                {myVotes.value}
              </div>
              <div className="text-xs font-semibold text-white/40">
                {myVotes.percentage}
              </div>
            </div>
          );
        }
      },
      {
        id: 'vote',
        header: 'VOTE (%)',
        cell: ({ row }) => (
          <VoteInput
            marketAddress={row.original.marketAddress}
            side={row.original.side}
            isDisabled={isVoting}
          />
        )
      }
    ],
    [chain, isVoting, selectedPool]
  );

  const voteSum = useMemo(() => {
    return Object.values(votes).reduce((sum, value) => {
      const numValue = parseFloat(value);
      return isNaN(numValue) ? sum : sum + numValue;
    }, 0);
  }, [votes]);

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
      />

      <VotesManagementFooter tokenId={tokenId} />
    </div>
  );
}

export default VotesManagement;
