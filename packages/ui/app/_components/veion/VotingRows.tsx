/* eslint-disable @next/next/no-img-element */
'use client';

import { TableRow, TableCell } from '@ui/components/ui/table';
import type { VotingData } from '@ui/constants/mock';

export default function VotingRows({
  id,
  network,
  supplyAsset,
  totalVotes,
  myVotes
}: VotingData) {
  return (
    <TableRow>
      <TableCell>{id}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <img
            alt="network"
            className="h-5 inline-block"
            src={`/img/symbols/32/color/${network.toLowerCase()}.png`}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = '/img/assets/warn.png';
            }}
          />
          {network}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <img
            alt="asset"
            className="h-5 inline-block"
            src={`/img/symbols/32/color/${supplyAsset.toLowerCase()}.png`}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = '/img/assets/warn.png';
            }}
          />
          {supplyAsset}
        </div>
      </TableCell>
      <TableCell>{totalVotes.percentage}</TableCell>
      <TableCell>{myVotes.percentage}</TableCell>
      <TableCell>
        <div className="flex items-center border border-white/30 rounded-md py-2 px-4 w-full">
          <input
            className="focus:outline-none font-bold bg-transparent disabled:text-white/60 flex-auto truncate"
            placeholder="Enter % Vote"
            type="string"
          />
          <button type="button">Max</button>
        </div>
      </TableCell>
    </TableRow>
  );
}
