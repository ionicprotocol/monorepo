'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@ui/components/ui/button';

import ExtendVeion from './ExtendVeion';
import ManagePopup from './ManagePopup';
import VeionClaim from './VeionClaim';

type VeionRowData = {
  id: string;
  tokensLocked: string;
  lockedBLP: {
    amount: string;
    value: string;
  };
  lockExpires: {
    date: string;
    timeLeft: string;
  };
  votingPower: string;
  network: string;
  enableClaim?: boolean;
  votingPercentage?: string;
  delegatedTo?: string;
  readyToDelegate?: boolean;
};

interface VeionRowProps {
  data: VeionRowData;
  viewType: 'Delegate veION' | 'MyVeion';
}

export default function VeionRow({ data, viewType }: VeionRowProps) {
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const router = useRouter();

  const {
    id,
    tokensLocked,
    lockedBLP,
    lockExpires,
    votingPower,
    network,
    enableClaim,
    delegatedTo,
    readyToDelegate
  } = data;

  // Data array for mapping over cells
  const baseData = [
    { label: 'ID', value: id, colSpan: 1 },
    { label: 'TOKENS LOCKED', value: tokensLocked, colSpan: 2 },
    { label: 'LOCKED BLP', value: lockedBLP.amount, colSpan: 1 },
    { label: 'LOCK EXPIRES', value: lockExpires.date, colSpan: 1 },
    { label: 'VOTING POWER', value: votingPower, colSpan: 1 }
  ];

  const additionalData =
    viewType === 'Delegate veION'
      ? [
          { label: 'DELEGATED TO', value: delegatedTo || '-', colSpan: 2 },
          { label: 'NETWORK', value: network, colSpan: 1 }
        ]
      : [{ label: 'NETWORK', value: network, colSpan: 2 }];

  const dataCells = [...baseData, ...additionalData];

  const cellClassName =
    'flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0';

  const DataCell = ({
    label,
    value,
    colSpan
  }: {
    label: string;
    value: string;
    colSpan: number;
  }) => (
    <div className={`col-span-${colSpan} ${cellClassName}`}>
      <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
        {label}
      </span>
      <span className="md:text-center text-right">{value}</span>
    </div>
  );

  // Buttons rendering
  let buttons = null;
  if (viewType === 'MyVeion') {
    const actionButtons = enableClaim
      ? [
          {
            label: 'Claim',
            onClick: () => setIsClaimOpen(true),
            className: 'bg-accent py-2 px-4 text-black rounded-md mr-2'
          },
          {
            label: 'Extend',
            onClick: () => setIsExtendOpen(true),
            className: 'bg-accent py-2 px-4 text-black rounded-md mr-2'
          }
        ]
      : [
          {
            label: 'Vote',
            onClick: () => router.push('/veion/governance/vote'),
            className: 'bg-white/10 py-2 px-4 text-white rounded-md mr-2'
          },
          {
            label: 'Manage',
            onClick: () => setIsManageOpen(true),
            className: 'bg-white/10 py-2 px-4 text-white rounded-md mr-2'
          }
        ];
    buttons = (
      <div className={`col-span-2 ${cellClassName}`}>
        {actionButtons.map((btn) => (
          <Button
            key={btn.label}
            onClick={btn.onClick}
            className={btn.className}
          >
            {btn.label}
          </Button>
        ))}
      </div>
    );
  } else if (viewType === 'Delegate veION') {
    buttons = (
      <div className={`col-span-1 ${cellClassName}`}>
        {readyToDelegate ? (
          <Button className="bg-accent py-2 px-4 text-black rounded-md mr-2">
            Undelegate
          </Button>
        ) : (
          <Button
            disabled
            className="bg-white/10 py-2 px-4 text-white/50 rounded-md mr-2"
          >
            {lockExpires.timeLeft}
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Include any modals or popups */}
      {viewType === 'MyVeion' && (
        <>
          <VeionClaim
            isOpen={isClaimOpen}
            onOpenChange={setIsClaimOpen}
          />
          <ExtendVeion
            isOpen={isExtendOpen}
            onOpenChange={setIsExtendOpen}
          />
          <ManagePopup
            isOpen={isManageOpen}
            onOpenChange={setIsManageOpen}
          />
        </>
      )}
      <div className="w-full h-full md:grid grid-cols-10 hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2 gap-x-1 relative py-4 text-sm content-center">
        {dataCells.map((item) => (
          <DataCell
            key={item.label}
            label={item.label}
            value={item.value}
            colSpan={item.colSpan}
          />
        ))}
        {buttons}
      </div>
    </>
  );
}
