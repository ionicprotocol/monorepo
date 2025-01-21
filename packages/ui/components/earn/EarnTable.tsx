'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { ExternalLink } from 'lucide-react';

import type { EarnRow } from '@ui/types/Earn';
import { earnOpps } from '@ui/utils/earnUtils';

import ActionButton from '../ActionButton';
import { AssetIcons } from '../AssetIcons';
import CommonTable from '../CommonTable';

import type { EnhancedColumnDef } from '../CommonTable';

export default function EarnTable() {
  const [rows, setRows] = useState<EarnRow[]>(earnOpps);

  useEffect(() => {
    const populateVals = async () => {
      await Promise.all(
        rows.map(async (row) => {
          row.apr = (await row.getApr?.()) ?? 0;
          row.tvl = (await row.getTvl?.()) ?? 0;
        })
      );
      setRows([...rows]);
    };
    populateVals();
  }, []);

  const columns: EnhancedColumnDef<EarnRow>[] = [
    {
      id: 'asset',
      header: 'ASSETS',
      sortingFn: 'alphabetical',
      cell: ({ row }) => (
        <div className="flex gap-3 items-center">
          <div className="flex -space-x-1">
            <AssetIcons
              rewards={row.original.asset}
              size={28}
            />
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
            src={row.original.img}
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
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <ActionButton
          href={row.original.link}
          target="_blank"
          disabled={!row.original.live}
          label={row.original.live ? 'Deposit' : 'Coming Soon'}
          rightIcon={ExternalLink}
        />
      )
    }
  ];

  return (
    <CommonTable
      data={rows}
      columns={columns}
      isLoading={false}
    />
  );
}
