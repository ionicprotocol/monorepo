/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';
import { formatEther } from 'viem';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient
} from 'wagmi';

// Create a single supabase client for interacting with your database
// import { simulateContract } from 'viem/contract'
import CountdownTimer from '../_components/claim/CountdownTimer';
import SeasonSelector from '../_components/claim/SeasonSelector';
import { claimAbi, claimContractAddress } from '../_constants/claim';
import {
  PublicSaleAbi,
  PublicSaleContractAddress
} from '../_constants/publicsale';

import { DROPDOWN } from '@ui/constants/index';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

export default function Claim() {
  const [currentClaimable, setCurrentClaimable] = useState(BigInt(0));
  const [publicClaimable, setPublicClaimable] = useState(BigInt(0));
  const [eligibleForToken, setEligibleForToken] = useState(BigInt(0));
  const [publicSaleEligibleToken, setPublicSaleEligibleToken] = useState(
    BigInt(0)
  );
  const [alreadyClaimed, setAlreadyClaimed] = useState(BigInt(0));
  const [publicSaleAlreadyClaimed, setPublicSaleAlreadyClaimed] = useState(
    BigInt(0)
  );
  const [open, setOpen] = useState<boolean>(false);
  const [dropdownSelectedCampaign, setDropdownSelectedCampaign] =
    useState<number>(DROPDOWN.AirdropSZN1);
  const [popupV2, setPopupV2] = useState<boolean>(false);
  const [agreement, setAgreement] = useState(false);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const newRef = useRef(null!);

  useEffect(() => {
    async function getVested() {
      try {
        if (!isConnected) return;
        await handleSwitchOriginChain(34443, chainId);
        const totalTokenData = await publicClient?.readContract({
          abi: claimAbi,
          address: claimContractAddress,
          args: [address],
          functionName: 'vests'
        });

        const claimable = await publicClient?.readContract({
          abi: claimAbi,
          address: claimContractAddress,
          args: [address],
          functionName: 'claimable'
        });

        const total = totalTokenData as [bigint, bigint];

        setCurrentClaimable(claimable as bigint);
        setEligibleForToken(total[0]);
        setAlreadyClaimed(total[1]);

        // eslint-disable-next-line no-console
        // console.log(totalTokenData, claimable);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    }
    getVested();
  }, [address, chainId, isConnected, publicClient]);

  useEffect(() => {
    async function getPublicSale() {
      try {
        if (!isConnected) return;
        await handleSwitchOriginChain(34443, chainId);
        const totalTokenData = await publicClient?.readContract({
          abi: PublicSaleAbi,
          address: PublicSaleContractAddress,
          args: [address],
          functionName: 'vests'
        });

        const claimable = await publicClient?.readContract({
          abi: PublicSaleAbi,
          address: PublicSaleContractAddress,
          args: [address],
          functionName: 'claimable'
        });

        const total = totalTokenData as [bigint, bigint];
        // console.log({ total, claimable }, claimable.toString());
        setPublicClaimable(claimable as bigint);
        setPublicSaleEligibleToken(total[0]);
        setPublicSaleAlreadyClaimed(total[1]);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    }
    getPublicSale();
  }, [address, chainId, isConnected, publicClient]);

  async function claimAirdrop() {
    try {
      if (!isConnected) {
        console.error('Not connected');
        return;
      }
      await handleSwitchOriginChain(34443, chainId);
      const tx = await walletClient!.writeContract({
        abi: claimAbi,
        account: walletClient?.account,
        address: claimContractAddress,
        args: [],
        functionName: 'claim'
      });
      // eslint-disable-next-line no-console
      console.log('Transaction Hash --->>>', tx);
      if (!tx) return;
      const transaction = await publicClient?.waitForTransactionReceipt({
        hash: tx
      });
      // eslint-disable-next-line no-console
      console.log('Transaction --->>>', transaction);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }
  async function claimPublicSale() {
    try {
      if (!isConnected) {
        console.error('Not connected');
        return;
      }
      await handleSwitchOriginChain(34443, chainId);
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
      // eslint-disable-next-line no-console
      console.log('Transaction --->>>', transaction);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleOutsideClick = (e: any) => {
    //@ts-ignore
    if (newRef.current && !newRef.current?.contains(e?.target)) {
      setOpen(false);
    }
  };

  return (
    <div
      className={`w-full bg-graylite dark:bg-grayone  flex   flex-col  gap-y-2  rounded-xl relative `}
    >
      <div className={`flex w-full transition-all duration-500 ease-out `}>
        <div className="min-w-full flex items-center justify-between  md:px-8 px-2 py-4 ">
          <div className="md:text-5xl text-lg md:m-8 m-2 tracking-wide md:gap-y-3 gap-y-1 flex flex-col md:leading-10 leading-6 ">
            <p>Welcome to the </p> <p>$ION Airdrop </p>
            {/* <button
              className={`md:w-52 w-max  bg-accent text-darkone rounded-lg py-2 px-6  cursor-pointer text-sm md:mt-4 mt-2`}
              onClick={() => setPopup(true)}
            >
              Check Eligibility
            </button> */}
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
            className={` grid grid-cols-5 justify-between items-center md:gap-x-6 gap-x-4 mt-8`}
          >
            <div className={`flex flex-col w-full  col-span-2`}>
              <span className={`opacity-40 text-xs `}>CHOOSE CAMPAIGN</span>
              <SeasonSelector
                dropdownSelectedCampaign={dropdownSelectedCampaign}
                newRef={newRef}
                open={open}
                setDropdownSelectedCampaign={setDropdownSelectedCampaign}
                setOpen={setOpen}
              />
            </div>
            <div className={`flex flex-col w-full h-full col-span-1`}>
              <span className={`opacity-40 text-xs self-start`}>
                VESTING PERIOD
              </span>
              <CountdownTimer
                dropdownSelectedCampaign={dropdownSelectedCampaign}
              />
            </div>
            <div className={`flex flex-col  w-full h-full col-span-2`}>
              <span className={`opacity-40 text-xs self-start`}>
                TOTAL TOKENS
              </span>
              <div
                className={`flex max-w-max relative items-center justify-start my-auto gap-2`}
              >
                <img
                  alt="ion logo"
                  className={`w-6 h-6`}
                  src="/img/symbols/32/color/ion.png"
                />
                {/* It will be dynamic */}
                <span className={`truncate`}>
                  {Number(
                    formatEther(
                      dropdownSelectedCampaign == DROPDOWN.AirdropSZN1
                        ? eligibleForToken
                        : publicSaleEligibleToken
                    )
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                  {Number(
                    formatEther(
                      dropdownSelectedCampaign == DROPDOWN.AirdropSZN1
                        ? currentClaimable
                        : publicClaimable
                    )
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: 2
                  })}{' '}
                  ION
                </span>
              </div>
              <button
                className={`bg-accent text-darkone py-1 ml-auto px-10 rounded-md ${
                  (dropdownSelectedCampaign === DROPDOWN.PublicSale ||
                    currentClaimable === BigInt(0)) &&
                  'opacity-40'
                }`}
                disabled={
                  dropdownSelectedCampaign === DROPDOWN.PublicSale ||
                  currentClaimable === BigInt(0)
                }
                onClick={() => {
                  setPopupV2(true);
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

            <p className={` text-xs text-start`}>
              Already claimed:{' '}
              {Number(
                formatEther(
                  dropdownSelectedCampaign == DROPDOWN.AirdropSZN1
                    ? alreadyClaimed
                    : publicSaleAlreadyClaimed
                )
              ).toLocaleString(undefined, {
                maximumFractionDigits: 2
              })}{' '}
              ION
            </p>
          </div>
        </div>
      </div>
      {popupV2 && dropdownSelectedCampaign === DROPDOWN.AirdropSZN1 && (
        <div
          className={`w-full bg-black/40 backdrop-blur-md z-50 flex items-center justify-center min-h-screen fixed top-0 left-0`}
        >
          <div
            className={`md:w-[30%] w-[70%] bg-grayone py-8 px-8 rounded-xl  flex flex-col items-center justify-center min-h-[20vh] relative text-center `}
          >
            <img
              alt="close"
              className={`absolute top-4 right-4 h-5 w-5 cursor-pointer z-20 opacity-70`}
              onClick={() => setPopupV2(false)}
              src="/img/assets/close.png"
            />
            <p className="w-full tracking-wide text-lg font-semibold mb-4">
              You can now instantly claim{' '}
              {Number(
                formatEther(
                  dropdownSelectedCampaign == DROPDOWN.AirdropSZN1
                    ? currentClaimable
                    : publicClaimable
                )
              ).toFixed(2)}{' '}
              ION
            </p>
            <p className={`opacity-40 text-xs `}>
              To receive the full Airdrop amount, please wait till the end of
              the vesting period
            </p>
            <div className="text-xs font-semibold flex gap-2 mt-4 flex-col">
              <div className={`flex w-full gap-2 mb-2`}>
                <input
                  className={`before:content[''] peer relative h-4 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-accent checked:bg-accent checked:before:bg-accent hover:before:opacity-10`}
                  id="checkme"
                  onChange={(e) => setAgreement(e.target.checked)}
                  type="checkbox"
                />
                <span>
                  I understand and agree to forfeit{' '}
                  {Number(
                    formatEther(
                      dropdownSelectedCampaign == DROPDOWN.AirdropSZN1
                        ? currentClaimable
                        : publicClaimable
                    )
                  ).toFixed(2)}{' '}
                  vested $ION, in favour of instantly receiving tokens now
                </span>
              </div>
              <button
                className={`bg-accent disabled:opacity-50 w-full text-darkone py-2 px-10 rounded-md`}
                disabled={!agreement}
                onClick={() => {
                  if (dropdownSelectedCampaign == DROPDOWN.AirdropSZN1) {
                    claimAirdrop();
                  }
                  if (dropdownSelectedCampaign == DROPDOWN.PublicSale) {
                    claimPublicSale();
                  }
                }}
              >
                Instant Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
