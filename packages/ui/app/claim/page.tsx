'use client';

import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { useState } from 'react';
import Confetti from 'react-confetti';
import { useAccount, useSignMessage } from 'wagmi';

// Create a single supabase client for interacting with your database

import ConnectButton from '../_components/ConnectButton';
import ResultHandler from '../_components/ResultHandler';

const supabase = createClient(
  'https://uoagtjstsdrjypxlkuzr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78'
);
const claimMessage = (nonce: string) => `Welcome to the $ION Airdrop!

Sign this message to prove you own this address!

Nonce: ${nonce}`;

const AIRDROP_URL = 'https://airdrop.ionic.ninja';
const AIRDROP_FIRST_TRANCHE = 0.16;

type User = {
  claimed: boolean;
  ion_amount: string;
  nonce: string;
  user: string;
};

export default function Claim() {
  const [eligibility, setEligibility] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [claimed, setClaimed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [popup, setPopup] = useState<boolean>(false);
  const account = useAccount();
  const { signMessageAsync } = useSignMessage();

  async function checkEligibility() {
    if (!account?.address) {
      throw new Error('No account address');
    }
    setPopup(true);
    setLoading(true);
    try {
      const { data: airdrop, error } = await supabase
        .from('airdrop')
        .select('*')
        .ilike('user', account.address);
      if (error) {
        throw new Error('Error fetching user: ' + error);
      }
      const [_user]: User[] = airdrop;
      if (!_user || BigInt(_user.ion_amount) === BigInt(0)) {
        throw new Error('User not found or amount is 0');
      }
      setUser(_user);
      setClaimed(_user.claimed);
      // setting the wallet if it is eligible or not
      setEligibility(true);
    } catch (error) {
      console.error('error: ', error);
      setEligibility(false);
    }
    // the checking from the api will be done here

    // the loading will be set here
    setLoading(false);
  }

  async function claimTokens() {
    setLoading(true);
    try {
      if (!user) {
        throw new Error('User not found');
      }
      const signature = await signMessageAsync({
        message: claimMessage(user.nonce)
      });
      const res = await fetch(`${AIRDROP_URL}/airdrop`, {
        body: JSON.stringify({ address: account.address, signature }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      });
      const data = await res.json();
      if (!data.res.data[0].claimed) {
        throw new Error('Claim not updated in DB!');
      }
      setClaimed(true);
    } catch (error) {
      console.error('error: ', error);
      setClaimed(false);
    }
    setLoading(false);
  }

  return (
    <div
      className={`w-full bg-graylite dark:bg-grayone  flex overflow-x-hidden rounded-xl relative `}
    >
      <div className={`flex w-full  transition-all duration-500 ease-out `}>
        <div className="min-w-full flex items-center justify-between  md:px-8 px-2 py-4 ">
          <div className="md:text-5xl text-lg md:m-8 m-2 tracking-wide md:gap-y-3 gap-y-1 flex flex-col md:leading-10 leading-6 ">
            <p>Welcome to the </p> <p>$ION Airdrop </p>
            <button
              className={`md:w-52 w-max  bg-accent text-darkone rounded-lg py-2 px-6  cursor-pointer text-sm md:mt-4 mt-2`}
              onClick={() => setPopup(true)}
            >
              Check Eligibility
            </button>
          </div>
          <div className="grid grid-cols-3 ml-auto gap-3">
            {[...Array(6)].map((_, index) => (
              <Image
                alt={`Image ${index}`}
                className="md:w-36 w-10  "
                key={index}
                src={'/img/ionEllipse.png'}
              />
            ))}
          </div>
        </div>
      </div>
      {popup && (
        <div
          className={`w-full bg-black/40 backdrop-blur-md z-50 flex items-center justify-center min-h-screen fixed top-0 left-0`}
        >
          {eligibility === true && popup === true && !claimed && (
            <Confetti
              gravity={0.06}
              height={1080}
              width={1420}
              wind={0.01}
            />
          )}
          <div
            className={`md:w-[30%] w-[70%] bg-grayone py-4 px-2 rounded-xl  flex flex-col items-center justify-center min-h-[20vh] relative`}
          >
            <Image
              alt="close"
              className={`absolute top-4 right-4 h-5 w-5 cursor-pointer z-20 opacity-70`}
              onClick={() => setPopup(false)}
              src="/img/assets/close.png"
            />
            <ResultHandler isLoading={loading}>
              {eligibility === null && (
                <div className="w-full px-2 mt-2 relative  items-center justify-center gap-x-2  cursor-pointer ">
                  <p className="w-full tracking-wide mb-4">Check Eligibility</p>

                  <div
                    className={`bg-accent w-max my-2 rounded-xl overflow-hidden text-black`}
                  >
                    <ConnectButton />
                  </div>

                  <p className=" text-sm text-white/60 mt-3 mb-5 ">
                    $ION airdrop will be send out to the confirmed eligible
                    wallet addresses by the Ionic Team. Once you sign in with
                    your wallet, no further actions needs to be taken
                  </p>
                  <button
                    className={` w-full  bg-accent text-darkone rounded-lg py-2 px-6  cursor-pointer text-sm  tracking-wide `}
                    onClick={() => checkEligibility()}
                  >
                    Check
                  </button>
                </div>
              )}

              {eligibility && eligibility === true ? (
                <div className="flex flex-col my-auto items-center justify-center relative px-2">
                  <Image
                    alt={`Image `}
                    className="md:w-6 w-6 mb-2 "
                    key={'id'}
                    src={'/img/success.png'}
                  />
                  <span className="text-center pb-6 font-semibold">
                    Congratulations, you are eligible for the airdrop! Your
                    allocation:
                  </span>
                  <span className="text-center pb-6 text-3xl">
                    {Number(user?.ion_amount ?? '0').toLocaleString()} $ION
                  </span>
                  <span className="text-center text-white/60 text-sm pb-4">
                    The first tranche of your $ION airdrop allocation (
                    {Math.floor(
                      Number(user?.ion_amount ?? '0') * AIRDROP_FIRST_TRANCHE
                    ).toLocaleString()}{' '}
                    $ION) will be distributed on May 30th directly to your
                    wallet address. The rest of the tokens are vested for 3
                    months. Details on vesting and instant claim will follow
                    soon.
                  </span>
                  <span className="text-center pb-5">
                    Press the button below to sign a message and prove ownership
                    of your address. After that, no further actions needed.
                  </span>
                </div>
              ) : eligibility === false ? (
                <div className="flex flex-col my-auto items-center justify-center ">
                  <Image
                    alt={`Image `}
                    className="md:w-6 w-6  mb-2"
                    key={'id'}
                    src={'/img/failure.png'}
                  />
                  <span className="text-center"> You are NOT eligible </span>
                </div>
              ) : null}
            </ResultHandler>

            {eligibility && eligibility ? (
              <button
                className={`mt-auto w-full ${
                  claimed
                    ? 'bg-graylite text-white'
                    : 'bg-accent cursor-pointer text-darkone'
                } rounded-lg py-2 px-6 text-sm `}
                disabled={claimed}
                onClick={() => claimTokens()}
              >
                {claimed ? 'Claimed' : 'Sign Using Your Wallet'}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
