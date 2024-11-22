// Claim.tsx
'use client';

import { formatEther } from 'viem';
import { DROPDOWN } from '@ui/constants/index';

type ClaimPanelProps = {
  dropdownSelectedCampaign: number;
  claimableTokens: bigint;
  isDisabled: boolean;
  setDialogOpen: (open: boolean) => void;
  publicVests: any;
  vestsS2: any;
};

const ClaimPanel: React.FC<ClaimPanelProps> = ({
  dropdownSelectedCampaign,
  claimableTokens,
  isDisabled,
  setDialogOpen,
  publicVests,
  vestsS2
}) => (
  <div className="w-full min-h-40 rounded-xl bg-grayone py-2 px-4 flex flex-col items-start justify-start gap-0">
    <p className="font-semibold text-lg">Unlocked Tokens</p>
    <div className="w-full flex items-start justify-start my-auto gap-2 flex-col">
      <div className="flex items-start w-full justify-start gap-2">
        <img
          alt="ion logo"
          className="w-6 h-6"
          src="/img/symbols/32/color/ion.png"
        />
        <div className="flex flex-col items-start justify-start gap-y-1">
          <span>
            {vestsS2?.result?.[2] &&
            dropdownSelectedCampaign === DROPDOWN.AirdropSZN2
              ? 0
              : Number(formatEther(claimableTokens)).toLocaleString(undefined, {
                  maximumFractionDigits: 2
                })}{' '}
            ION
          </span>
        </div>
        <button
          className="bg-accent text-darkone py-1 ml-auto px-10 rounded-md disabled:opacity-40"
          disabled={isDisabled}
          onClick={() => setDialogOpen(true)}
        >
          Claim
        </button>
      </div>
      <p className="opacity-40 text-xs text-start">
        {dropdownSelectedCampaign === DROPDOWN.PublicSale
          ? 'The tokens are linearly unlocked for 80 days (1% per day)'
          : 'The tokens are fully unlocked on the last day of the vesting period'}
      </p>
      {dropdownSelectedCampaign === DROPDOWN.PublicSale && (
        <p className="text-xs text-start">
          Already claimed:{' '}
          {Number(
            formatEther(publicVests?.result?.[1] ?? BigInt(0))
          ).toLocaleString(undefined, {
            maximumFractionDigits: 2
          })}{' '}
          ION
        </p>
      )}
    </div>
  </div>
);

export default ClaimPanel;
