// Claim.tsx
'use client';

import { useState } from 'react';

import { formatEther } from 'viem';
import { mode } from 'viem/chains';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContracts,
  useWalletClient
} from 'wagmi';

import ClaimDialog from '@ui/components/claim/ClaimDialog';
import ClaimPanel from '@ui/components/claim/ClaimPanel';
import InfoPanel from '@ui/components/claim/InfoPanel';
import { DROPDOWN } from '@ui/constants/index';
import { useOutsideClick } from '@ui/hooks/useOutsideClick';

import { claimAbi, claimContractAddressSeason2 } from '../../constants/claim';
import {
  PublicSaleAbi,
  PublicSaleContractAddress
} from '../../constants/publicsale';

export default function Claim() {
  const [loading, setLoading] = useState(false);
  const [dropdownSelectedCampaign, setDropdownSelectedCampaign] =
    useState<number>(DROPDOWN.AirdropSZN2);
  const [dialogOpen, setDialogOpen] = useState(false);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const { data } = useReadContracts({
    contracts: [
      {
        address: claimContractAddressSeason2,
        abi: claimAbi,
        args: [address!],
        functionName: 'vests',
        chainId: mode.id
      },
      {
        abi: claimAbi,
        address: claimContractAddressSeason2,
        args: [address!],
        functionName: 'claimable',
        chainId: mode.id
      },
      {
        abi: PublicSaleAbi,
        address: PublicSaleContractAddress,
        args: [address!],
        functionName: 'vests',
        chainId: mode.id
      },
      {
        abi: PublicSaleAbi,
        address: PublicSaleContractAddress,
        args: [address!],
        functionName: 'claimable',
        chainId: mode.id
      }
    ]
  });

  const [vestsS2, claimableS2, publicVests, publicClaimable] = data || [];

  const {
    componentRef: newRef,
    isopen: open,
    toggle: seasonclose
  } = useOutsideClick();

  const tokenMapping = {
    [DROPDOWN.AirdropSZN2]: vestsS2?.result?.[0],
    [DROPDOWN.PublicSale]: publicVests?.result?.[0]
  };

  const claimableMapping = {
    [DROPDOWN.AirdropSZN2]: claimableS2?.result,
    [DROPDOWN.PublicSale]: publicClaimable?.result
  };

  const totalTokens = tokenMapping[dropdownSelectedCampaign] || BigInt(0);
  const claimableTokens =
    claimableMapping[dropdownSelectedCampaign] || BigInt(0);

  const isDisabled = !!(
    Number(formatEther(claimableTokens)) === 0 ||
    (dropdownSelectedCampaign === DROPDOWN.AirdropSZN2 && vestsS2?.result?.[2])
  );

  return (
    <div className="w-full bg-graylite dark:bg-grayone flex flex-col gap-y-2 rounded-xl relative">
      <div className="flex w-full transition-all duration-500 ease-out">
        <div className="min-w-full flex items-center justify-between md:px-8 px-2 py-4">
          <div className="md:text-5xl text-lg md:m-8 m-2 tracking-wide md:gap-y-3 gap-y-1 flex flex-col md:leading-10 leading-6">
            <p>Welcome to the</p>
            <p>$ION Airdrop</p>
            <button
              className="rounded-md bg-accent disabled:opacity-50 text-black py-1.5 text-xs uppercase truncate w-max px-6 mt-4"
              disabled
            >
              Eligibility Check Period Expired
            </button>
          </div>
          <div className="grid grid-cols-3 ml-auto gap-3">
            {[...Array(6)].map((_, index) => (
              <img
                alt={`Image ${index}`}
                className="md:w-36 w-10"
                key={index}
                src={'/img/ionEllipse.png'}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="w-full h-max grid md:grid-cols-2 grid-cols-1 gap-y-4 md:gap-y-0 gap-x-4 bg-darkone py-4">
        <InfoPanel
          dropdownSelectedCampaign={dropdownSelectedCampaign}
          setDropdownSelectedCampaign={setDropdownSelectedCampaign}
          newRef={newRef}
          open={open}
          seasonclose={seasonclose}
          totalTokens={totalTokens}
          vestsS2={vestsS2}
        />
        <ClaimPanel
          dropdownSelectedCampaign={dropdownSelectedCampaign}
          claimableTokens={claimableTokens}
          isDisabled={isDisabled}
          setDialogOpen={setDialogOpen}
          publicVests={publicVests}
          vestsS2={vestsS2}
        />
      </div>
      <ClaimDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        dropdownSelectedCampaign={dropdownSelectedCampaign}
        claimableTokens={claimableTokens}
        totalTokens={totalTokens}
        loading={loading}
        isDisabled={isDisabled}
        isConnected={isConnected}
        chainId={chainId}
        walletClient={walletClient}
        publicClient={publicClient}
        setLoading={setLoading}
      />
    </div>
  );
}
