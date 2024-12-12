'use client';

import Image from 'next/image';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@ui/components/ui/dialog';
import { Input } from '@ui/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@ui/components/ui/tabs';
import { useMorphoData } from '@ui/hooks/earn/useMorphoData';
import type { MorphoRow } from '@ui/types/Earn';
import { morphoVaults } from '@ui/utils/morphoUtils';

import CommonTable from '../CommonTable';

import type { EnhancedColumnDef } from '../CommonTable';

export default function MorphoTable() {
  const { rows, isLoading } = useMorphoData(morphoVaults);

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
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">Manage</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Manage {row.original.asset.join('/')} Vault
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="supply">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="supply">Supply</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              </TabsList>
              <TabsContent value="supply">
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Amount"
                  />
                  <Button className="w-full">Supply</Button>
                </div>
              </TabsContent>
              <TabsContent value="withdraw">
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Amount"
                  />
                  <Button className="w-full">Withdraw</Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )
    }
  ];

  return (
    <CommonTable
      data={rows}
      columns={columns}
      isLoading={isLoading}
    />
  );
}
