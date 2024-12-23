import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import CommonTable from '../../_components/CommonTable';

import type { EnhancedColumnDef } from '../../_components/CommonTable';
import { VaultRowData } from '@ui/types/SupplyVaults';
import ActionButton from '../ActionButton';
import { useState } from 'react';
import SupplyVaultDialog from '../dialogs/SupplyVault';
import TokenBalance from './Cells/TokenBalance';

export default function SupplyVaultTable({
  marketData,
  isLoading
}: {
  marketData: VaultRowData[];
  isLoading: boolean;
}) {
  const [isSupplyVaultDialogOpen, setIsSupplyVaultDialogOpen] =
    useState<boolean>(false);
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const { address } = useMultiIonic();
  const [selectedVaultData, setSelectedVaultData] = useState<VaultRowData>();

  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : mode.id.toString();

  const columns: EnhancedColumnDef<VaultRowData>[] = [
    {
      id: 'asset',
      header: <div className="pl-6">ASSETS</div>,
      sortingFn: 'alphabetical',
      cell: ({ row }) => (
        <Link
          href={{
            pathname: `/market/vault/${row.original.asset}`,
            query: {
              chain,
              dropdownSelectedChain: chain,
              selectedChain: chainId,
              selectedSymbol: row.original.asset
            }
          }}
          className="flex gap-3 items-center pl-6"
        >
          <Image
            src={row.original.logo}
            alt={row.original.asset}
            width={28}
            height={28}
            className="w-7 h-7"
          />
          <span className="text-sm">{row.original.asset}</span>
        </Link>
      )
    },
    {
      id: 'strategy',
      header: 'STRATEGY',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm">{row.original.strategy.description}</span>
          <div className="flex flex-wrap gap-1">
            {row.original.strategy.distribution.map((dist, idx) => (
              <span
                key={idx}
                className="text-xs text-white/40"
              >
                {dist.poolName}: {dist.percentage}%
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'apr',
      header: 'APR',
      sortingFn: 'numerical',
      accessorFn: (row) => row.apr.total,
      cell: ({ row }) => <span>{row.original.apr.total.toFixed(2)}%</span>
    },
    {
      id: 'totalSupply',
      header: 'TOTAL SUPPLY',
      sortingFn: 'numerical',
      cell: ({ row }) => (
        <TokenBalance
          balance={row.original.totalSupply.tokens}
          balanceUSD={row.original.totalSupply.usd}
          tokenName={row.original.asset}
        />
      )
    },
    {
      id: 'utilisation',
      header: 'UTILISATION RATE',
      sortingFn: 'numerical',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-white/10 rounded-full h-2">
            <div
              className="bg-accent h-full rounded-full"
              style={{ width: `${row.original.utilisation}%` }}
            />
          </div>
          <span>{row.original.utilisation}%</span>
        </div>
      )
    },
    {
      id: 'userPosition',
      header: 'YOUR POSITION',
      sortingFn: 'numerical',
      cell: ({ row }) => (
        <TokenBalance
          balance={row.original.userPosition.tokens}
          balanceUSD={row.original.userPosition.usd}
          tokenName={row.original.asset}
        />
      )
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      enableSorting: false,
      cell: ({ row }) => (
        <ActionButton
          action={async () => {
            const result = await handleSwitchOriginChain(+chain, chainId);
            console.log('result', result);
            if (result) {
              setSelectedVaultData(row.original);
              setIsSupplyVaultDialogOpen(true);
            }
          }}
          disabled={!address}
          label="Manage"
        />
      )
    }
  ];

  return (
    <>
      <CommonTable
        data={marketData}
        columns={columns}
        isLoading={isLoading}
      />

      {selectedVaultData && (
        <SupplyVaultDialog
          isOpen={isSupplyVaultDialogOpen}
          setIsOpen={setIsSupplyVaultDialogOpen}
          selectedVaultData={selectedVaultData}
          chainId={chainId}
        />
      )}
    </>
  );
}
