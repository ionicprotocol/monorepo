/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';

// import { createClient } from '@supabase/supabase-js';
import { formatEther } from 'viem';
import { mode } from 'viem/chains';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContracts,
  useWalletClient
} from 'wagmi';

// const supabase = createClient(
//   'https://uoagtjstsdrjypxlkuzr.supabase.co/rest/v1/airdrop_season_2?select=*',
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78'
// );

// Create a single supabase client for interacting with your database
// import { simulateContract } from 'viem/contract'
import { DROPDOWN } from '@ui/constants/index';
import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import {
  claimAbi,
  claimContractAddress,
  claimContractAddressSeason2
} from '../../constants/claim';
import {
  PublicSaleAbi,
  PublicSaleContractAddress
} from '../../constants/publicsale';
import ClaimDialog from '../_components/claim/ClaimDialog';
import CountdownTimer from '../_components/claim/CountdownTimer';
import EligibilityPopup from '../_components/claim/EligibilityPopup';
import SeasonSelector from '../_components/claim/SeasonSelector';

// import type { User } from '../_components/claim/EligibilityPopup';

export default function Claim() {
  const [loading, setLoading] = useState(false);
  const [dropdownSelectedCampaign, setDropdownSelectedCampaign] =
    useState<number>(DROPDOWN.AirdropSZN2);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agreement, setAgreement] = useState(false);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const { data } = useReadContracts({
    contracts: [
      {
        address: claimContractAddress,
        abi: claimAbi,
        args: [address!],
        functionName: 'vests',
        chainId: mode.id
      },
      {
        abi: claimAbi,
        address: claimContractAddress,
        args: [address!],
        functionName: 'claimable',
        chainId: mode.id
      },
      {
        abi: claimAbi,
        address: claimContractAddressSeason2,
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
  const [
    vestsS1,
    claimableS1,
    vestsS2,
    claimableS2,
    publicVests,
    publicClaimable
  ] = data || [];
  // const newRef = useRef(null!);

  async function claimAirdrop() {
    try {
      if (!isConnected) {
        console.error('Not connected');
        return;
      }
      await handleSwitchOriginChain(mode.id, chainId);
      setLoading(true);
      const tx = await walletClient!.writeContract({
        abi: claimAbi,
        account: walletClient?.account,
        address: claimContractAddress,
        args: [],
        functionName: 'claim'
      });

      if (!tx) return;
      const transaction = await publicClient?.waitForTransactionReceipt({
        hash: tx
      });
      setLoading(false);
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setDialogOpen(false);
    }
  }
  async function claimPublicSale() {
    try {
      if (!isConnected) {
        console.error('Not connected');
        return;
      }
      await handleSwitchOriginChain(mode.id, chainId);
      setLoading(true);
      const tx = await walletClient!.writeContract({
        abi: PublicSaleAbi,
        account: walletClient?.account,
        address: PublicSaleContractAddress,
        args: [],
        functionName: 'claim'
      });
      // eslint-disable-next-line no-console
      console.log('Transaction Hash --->>>', tx);
      if (!tx) return;
      const transaction = await publicClient?.waitForTransactionReceipt({
        hash: tx
      });
      setLoading(false);
      setDialogOpen(false);
      // eslint-disable-next-line no-console
      console.log('Transaction --->>>', transaction);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      setLoading(false);
      setDialogOpen(false);
    } finally {
      setLoading(false);
      setDialogOpen(false);
    }
  }

  const {
    componentRef: eligibleRef,
    isopen: eligibleOpen,
    toggle: eligibletoggle
  } = useOutsideClick();
  const {
    componentRef: newRef,
    isopen: open,
    toggle: seasonclose
  } = useOutsideClick();

  // eligible for tokens

  // claimed tokens

  const tokenMapping = {
    [DROPDOWN.AirdropSZN1]: vestsS1?.result?.[0],
    [DROPDOWN.AirdropSZN2]: vestsS2?.result?.[0], // can add more campaigns like this
    [DROPDOWN.PublicSale]: publicVests?.result?.[0]
  };

  const claimableMapping = {
    [DROPDOWN.AirdropSZN1]: claimableS1?.result,
    [DROPDOWN.AirdropSZN2]: claimableS2?.result, // Add more campaigns as needed
    [DROPDOWN.PublicSale]: publicClaimable?.result
  };

  // const claimableCampaigns = [DROPDOWN.AirdropSZN1, DROPDOWN.AirdropSZN2];
  const totalTokens = tokenMapping[dropdownSelectedCampaign] || BigInt(0);
  const claimableTokens =
    claimableMapping[dropdownSelectedCampaign] || BigInt(0);

  const isDisabled = !!(
    Number(formatEther(claimableTokens)) === 0 ||
    (dropdownSelectedCampaign === DROPDOWN.AirdropSZN1 &&
      vestsS1?.result?.[2]) ||
    (dropdownSelectedCampaign === DROPDOWN.AirdropSZN2 && vestsS2?.result?.[2])
  );

  // ||
  // (dropdownSelectedCampaign in claimableCampaigns && haveClaimed)

  // const isDisabledClaim =
  //   (dropdownSelectedCampaign == DROPDOWN.AirdropSZN1! ||
  //     dropdownSelectedCampaign == DROPDOWN.AirdropSZN2!) &&
  //   agreement;

  // const isDisabledClaim = publicClaimable > BigInt(0) ? false : true;

  return (
    <div
      className={`w-full bg-graylite dark:bg-grayone  flex   flex-col  gap-y-2  rounded-xl relative `}
    >
      {eligibleOpen && (
        <EligibilityPopup
          eligibilityOpen={eligibleOpen}
          // loading={false}
          eligibleRef={eligibleRef}
          close={() => eligibletoggle()}
        />
      )}
      <div className={`flex w-full transition-all duration-500 ease-out `}>
        <div className="min-w-full flex items-center justify-between  md:px-8 px-2 py-4 ">
          <div className="md:text-5xl text-lg md:m-8 m-2 tracking-wide md:gap-y-3 gap-y-1 flex flex-col md:leading-10 leading-6 ">
            <p>Welcome to the </p> <p>$ION Airdrop </p>
            <button
              className={`rounded-md bg-accent disabled:opacity-50 text-black py-1.5  text-xs  uppercase truncate w-max px-6 mt-4 `}
              // onClick={() => eligibletoggle()}
              disabled={true}
            >
              Eligibility Check Period Expired
            </button>
          </div>
          <div className="grid grid-cols-3 ml-auto gap-3">
            {[...Array(6)].map((_, index) => (
              <img
                alt={`Image ${index}`}
                className="md:w-36 w-10  "
                key={index}
                src={'/img/ionEllipse.png'}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        className={`w-full  h-max grid md:grid-cols-2 grid-cols-1 gap-y-4 md:gap-y-0 gap-x-4 bg-darkone py-4`}
      >
        <div
          className={`w-full min-h-40 rounded-xl bg-grayone py-2 px-4 flex flex-col `}
        >
          <p className={`font-semibold text-lg `}>General info</p>
          <div
            className={` flex justify-evenly items-center md:gap-x-6 gap-x-4 mt-8`}
          >
            <div className={`flex flex-col w-full  lg:col-span-2`}>
              <span className={`opacity-40 lg:text-xs text-[11px] `}>
                CHOOSE CAMPAIGN
              </span>
              <SeasonSelector
                dropdownSelectedCampaign={dropdownSelectedCampaign}
                newRef={newRef}
                open={open}
                setDropdownSelectedCampaign={setDropdownSelectedCampaign}
                setOpen={() => seasonclose()}
              />
            </div>
            <div className={`flex flex-col w-max h-full lg:col-span-1`}>
              <span
                className={`opacity-40 lg:text-xs text-[11px]  md:self-start self-center`}
              >
                VESTING PERIOD
              </span>
              {(vestsS1?.result?.[2] &&
                dropdownSelectedCampaign === DROPDOWN.AirdropSZN1) ||
              (vestsS2?.result?.[2] &&
                dropdownSelectedCampaign === DROPDOWN.AirdropSZN2) ? (
                <span
                  className={`lg:text-xs text-[11px] my-auto  md:self-start self-center`}
                >
                  Already Claimed
                </span>
              ) : (
                <CountdownTimer
                  dropdownSelectedCampaign={dropdownSelectedCampaign}
                />
              )}
            </div>
            <div className={`flex flex-col  w-full h-full lg:col-span-2`}>
              <span
                className={`opacity-40 lg:text-xs text-[11px] md:self-start self-center`}
              >
                TOTAL TOKENS
              </span>
              <div
                className={`flex max-w-max relative items-center  md:self-start self-center my-auto gap-2`}
              >
                <img
                  alt="ion logo"
                  className={`w-6 h-6`}
                  src="/img/symbols/32/color/ion.png"
                />
                {/* It will be dynamic */}
                <span className={`truncate`}>
                  {Number(formatEther(totalTokens)).toLocaleString(undefined, {
                    maximumFractionDigits: 0
                  })}
                </span>
                ION
                {/* <span
                  className={`absolute -bottom-5 text-xs opacity-40 left-7`}
                >
                  $1234
                </span> */}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`w-full min-h-40 rounded-xl bg-grayone py-2 px-4 flex flex-col items-start justify-start gap-0 `}
        >
          <p className={`font-semibold text-lg `}>Unlocked Tokens</p>
          <div
            className={`w-full flex items-start justify-start  my-auto gap-2 flex-col`}
          >
            <div className={`flex  items-start w-full justify-start  gap-2`}>
              <img
                alt="ion logo"
                className={`w-6 h-6`}
                src="/img/symbols/32/color/ion.png"
              />{' '}
              {/* It will be dynamic */}
              <div
                className={`flex flex-col items-start justify-start gap-y-1`}
              >
                <span>
                  {(dropdownSelectedCampaign != DROPDOWN.PublicSale &&
                    vestsS1?.result?.[2] &&
                    dropdownSelectedCampaign == DROPDOWN.AirdropSZN1) ||
                  (vestsS2?.result?.[2] &&
                    dropdownSelectedCampaign == DROPDOWN.AirdropSZN2)
                    ? 0
                    : Number(formatEther(claimableTokens)).toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 2
                        }
                      )}{' '}
                  {/* {Number(publicClaimable)} */}
                  ION
                </span>
              </div>
              <button
                className={`bg-accent text-darkone py-1  ml-auto px-10 rounded-md disabled:opacity-40 `}
                disabled={isDisabled}
                onClick={() => {
                  setDialogOpen(true);
                }}
              >
                Claim
              </button>
            </div>
            <p className={`opacity-40 text-xs text-start`}>
              {dropdownSelectedCampaign === DROPDOWN.PublicSale
                ? 'The tokens are linearly unlocked for 80 days (1% per day)'
                : 'The tokens are fully unlocked on the last day of the vesting period'}
            </p>

            {dropdownSelectedCampaign === DROPDOWN.PublicSale && (
              <p className={` text-xs text-start`}>
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
      </div>
      <ClaimDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        dropdownSelectedCampaign={dropdownSelectedCampaign}
        claimableTokens={claimableTokens}
        totalTokens={totalTokens}
        loading={loading}
        claimAirdrop={claimAirdrop}
        claimPublicSale={claimPublicSale}
        isDisabled={isDisabled}
      />
    </div>
  );
}
