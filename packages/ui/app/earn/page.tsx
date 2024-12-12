'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { EarnRow } from '@ui/utils/earnUtils';
import { earnOpps } from '@ui/utils/earnUtils';
import CommonTable from '../_components/CommonTable';
import type { EnhancedColumnDef } from '../_components/CommonTable';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@ui/components/ui/card';

export default function Earn() {
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
      cell: ({ row }) => (
        <div className="flex gap-3 items-center">
          <div className="flex -space-x-1">
            {row.original.asset.map((coin, idx) => (
              <img
                key={idx}
                src={`/img/symbols/32/color/${coin}.png`}
                alt={coin}
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
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img
            src={row.original.img}
            alt={row.original.protocol}
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
        <img
          src={`/img/logo/${row.original.network}.png`}
          alt={row.original.network}
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
        <Link
          href={row.original.link}
          target="_blank"
          className={`rounded-md bg-accent text-black py-2.5 px-4 capitalize truncate disabled:opacity-50 w-full inline-flex items-center justify-center gap-1.5 ${
            !row.original.live && 'opacity-50'
          }`}
        >
          {row.original.live ? 'Deposit' : 'Coming Soon'}
          <img
            alt="external-link"
            className="w-3 h-3"
            src="https://img.icons8.com/material-outlined/24/external-link.png"
          />
        </Link>
      )
    }
  ];

  return (
    <Card className="bg-grayone">
      <CardHeader>
        <CardTitle className="text-center text-white/80">
          ✨ Earn extra yield using the opportunities listed to make use of your
          Ionic deposits! ✨
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CommonTable
          data={rows}
          columns={columns}
          isLoading={false}
        />
      </CardContent>
    </Card>
  );
}
