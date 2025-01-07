'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useMorphoData } from '@ui/hooks/earn/useMorphoData';
import type { MorphoRow } from '@ui/types/Earn';
import { morphoBaseAddresses } from '@ui/utils/morphoUtils';

import MorphoApyCell from './MorphoApyCell';
import ActionButton from '../ActionButton';
import { AssetIcons } from '../AssetIcons';
import CommonTable from '../CommonTable';
import { CopyButton } from '../CopyButton';
import { MorphoDialog } from '../dialogs/MorphoVault';

import type { EnhancedColumnDef } from '../CommonTable';

export default function MorphoTable() {
  const { rows, isLoading } = useMorphoData({
    isLegacy: false
  });
  const [isManageDialogOpen, setIsManageDialogOpen] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<string[]>([]);

  const columns: EnhancedColumnDef<MorphoRow>[] = [
    {
      id: 'asset',
      header: 'ASSETS',
      sortingFn: 'alphabetical',
      cell: ({ row }) => (
        <Link
          href={row.original.link}
          target="_blank"
          className="flex gap-3 items-center hover:underline"
        >
          <div className="flex -space-x-1">
            <AssetIcons
              rewards={row.original.asset}
              size={28}
            />
          </div>
          <div className="flex items-center gap-2">
            {row.original.asset.map((val, idx) => (
              <span key={idx}>
                {idx !== 0 && '/'} {val}
              </span>
            ))}
            <CopyButton
              value={
                morphoBaseAddresses.vaults[
                  row.original
                    .asset[0] as keyof typeof morphoBaseAddresses.vaults
                ]
              }
              message={`${row.original.asset[0]} vault address copied to clipboard`}
              tooltipMessage="Copy vault address"
            />
          </div>
        </Link>
      )
    },
    {
      id: 'protocol',
      header: 'PROTOCOL',
      sortingFn: 'alphabetical',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image
            src="/img/symbols/32/color/morpho.png"
            alt={row.original.protocol}
            width={20}
            height={20}
            className="w-5 h-5"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = '/img/assets/info.png';
            }}
          />
          <span>{row.original.protocol}</span>
        </div>
      )
    },
    {
      id: 'strategy',
      header: 'STRATEGY',
      cell: ({ row }) => <span>{row.original.strategy}</span>
    },
    {
      id: 'network',
      header: 'NETWORK',
      cell: ({ row }) => (
        <Image
          src={`/img/logo/${row.original.network}.png`}
          alt={row.original.network}
          width={24}
          height={24}
          className="w-6 h-6"
        />
      )
    },
    {
      id: 'apy',
      header: 'APY',
      sortingFn: 'numerical',
      cell: ({ row }) => <MorphoApyCell row={row} />
    },
    {
      id: 'tvl',
      header: 'TVL',
      sortingFn: 'numerical',
      width: '15%',
      cell: ({ row }) => (
        <div className="flex flex-col items-start">
          <span>
            {row.original.tvl.tokenAmount.toLocaleString(undefined, {
              maximumFractionDigits: 2
            })}{' '}
            {row.original.asset[0]}
          </span>
          <span className="text-xs text-white/40 font-light">
            $
            {row.original.tvl.usdValue.toLocaleString(undefined, {
              maximumFractionDigits: 2
            })}
          </span>
        </div>
      )
    },
    {
      id: 'manage',
      header: 'MANAGE',
      enableSorting: false,
      cell: ({ row }) => (
        <ActionButton
          label="Manage"
          action={() => {
            setIsManageDialogOpen(true);
            setSelectedAsset(row.original.asset);
          }}
        />
      )
    }
  ];

  return (
    <>
      <CommonTable
        data={rows as MorphoRow[]}
        columns={columns}
        isLoading={isLoading}
      />
      <MorphoDialog
        asset={selectedAsset}
        isOpen={isManageDialogOpen}
        setIsOpen={setIsManageDialogOpen}
      />
    </>
  );
}
