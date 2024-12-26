// Claim.tsx
'use client';

import { formatEther } from 'viem';

import { DROPDOWN } from '@ui/constants/index';

import CountdownTimer from './CountdownTimer';
import SeasonSelector from './SeasonSelector';

type InfoPanelProps = {
  dropdownSelectedCampaign: number;
  setDropdownSelectedCampaign: (campaign: number) => void;
  newRef: any;
  open: boolean;
  seasonclose: () => void;
  totalTokens: bigint;
  vestsS2: any;
};

const InfoPanel: React.FC<InfoPanelProps> = ({
  dropdownSelectedCampaign,
  setDropdownSelectedCampaign,
  newRef,
  open,
  seasonclose,
  totalTokens,
  vestsS2
}) => (
  <div className="w-full min-h-40 rounded-xl bg-grayone py-2 px-4 flex flex-col">
    <p className="font-semibold text-lg">General info</p>
    <div className="flex justify-evenly items-center md:gap-x-6 gap-x-4 mt-8">
      <div className="flex flex-col w-full lg:col-span-2">
        <span className="opacity-40 lg:text-xs text-[11px]">
          CHOOSE CAMPAIGN
        </span>
        <SeasonSelector
          dropdownSelectedCampaign={dropdownSelectedCampaign}
          newRef={newRef}
          open={open}
          setDropdownSelectedCampaign={setDropdownSelectedCampaign}
          setOpen={seasonclose}
        />
      </div>
      <div className="flex flex-col w-max h-full lg:col-span-1">
        <span className="opacity-40 lg:text-xs text-[11px] md:self-start self-center">
          VESTING PERIOD
        </span>
        {vestsS2?.result?.[2] &&
        dropdownSelectedCampaign === DROPDOWN.AirdropSZN2 ? (
          <span className="lg:text-xs text-[11px] my-auto md:self-start self-center">
            Already Claimed
          </span>
        ) : (
          <CountdownTimer dropdownSelectedCampaign={dropdownSelectedCampaign} />
        )}
      </div>
      <div className="flex flex-col w-full h-full lg:col-span-2">
        <span className="opacity-40 lg:text-xs text-[11px] md:self-start self-center">
          TOTAL TOKENS
        </span>
        <div className="flex max-w-max relative items-center md:self-start self-center my-auto gap-2">
          <img
            alt="ion logo"
            className="w-6 h-6"
            src="/img/symbols/32/color/ion.png"
          />
          <span className="truncate">
            {Number(formatEther(totalTokens)).toLocaleString(undefined, {
              maximumFractionDigits: 0
            })}
          </span>
          ION
        </div>
      </div>
    </div>
  </div>
);

export default InfoPanel;
