'use client';

import Image from 'next/image';

import { useMorphoData } from '@ui/hooks/earn/useMorphoData';
import type { MorphoRow } from '@ui/types/Earn';

import { MorphoDialog } from './MorphoDialog';
import CommonTable from '../CommonTable';

import type { EnhancedColumnDef } from '../CommonTable';
import { useState } from 'react';
import ActionButton from '../ActionButton';

export default function MorphoTable() {
  const { rows, isLoading } = useMorphoData();
  const [isManageDialogOpen, setIsManageDialogOpen] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<string[]>([]);

  const columns: EnhancedColumnDef<MorphoRow>[] = [
    {
      id: 'asset',
      header: 'ASSETS',
      sortingFn: 'alphabetical',
      cell: ({ row }) => (
        <div className="flex gap-3 items-center">
          <div className="flex -space-x-1">
            {row.original.asset.map((coin, idx) => (
              <Image
                key={idx}
                src={`/img/symbols/32/color/${coin}.png`}
                alt={coin}
                width={28}
                height={28}
                className="w-7 h-7"
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            {row.original.asset.map((val, idx) => (
              <span key={idx}>
                {idx !== 0 && '/'}
                {val}
              </span>
            ))}
          </div>
        </div>
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
      id: 'apr',
      header: 'APR',
      sortingFn: 'numerical',
      cell: ({ row }) => (
        <span>{row.original.apr > 0 ? `${row.original.apr}%` : '∞%'}</span>
      )
    },
    {
      id: 'tvl',
      header: 'TVL',
      sortingFn: 'numerical',
      cell: ({ row }) => (
        <span>
          $
          {row.original.tvl > 0
            ? row.original.tvl.toLocaleString(undefined, {
                maximumFractionDigits: 2
              })
            : '-'}
        </span>
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
        data={rows}
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
