'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Button } from '@ui/components/ui/button';
import { TableRow, TableCell } from '@ui/components/ui/table';

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

  // Action buttons
  let actionButton = null;
  if (viewType === 'MyVeion') {
    actionButton = (
      <TableCell>
        {enableClaim ? (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsClaimOpen(true)}
              className="bg-accent text-black"
            >
              Claim
            </Button>
            <Button
              onClick={() => setIsExtendOpen(true)}
              className="bg-accent text-black"
            >
              Extend
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {/* Use Link component to wrap the Vote button */}
            <Link href="/veion/vote">
              <Button className="bg-white/10 text-white">Vote</Button>
            </Link>
            <Button
              onClick={() => setIsManageOpen(true)}
              className="bg-white/10 text-white"
            >
              Manage
            </Button>
          </div>
        )}
      </TableCell>
    );
  } else if (viewType === 'Delegate veION') {
    actionButton = (
      <TableCell>
        {readyToDelegate ? (
          <Button className="bg-accent text-black">Undelegate</Button>
        ) : (
          <Button
            disabled
            className="bg-white/10 text-white/50"
          >
            {lockExpires.timeLeft}
          </Button>
        )}
      </TableCell>
    );
  }

  return (
    <>
      {/* Modals */}
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

      <TableRow>
        <TableCell>{id}</TableCell>
        <TableCell>{tokensLocked}</TableCell>
        <TableCell>{lockedBLP.amount}</TableCell>
        <TableCell>{lockExpires.date}</TableCell>
        <TableCell>{votingPower}</TableCell>
        {viewType === 'Delegate veION' && (
          <TableCell>{delegatedTo || '-'}</TableCell>
        )}
        <TableCell>{network}</TableCell>
        {actionButton}
      </TableRow>
    </>
  );
}
