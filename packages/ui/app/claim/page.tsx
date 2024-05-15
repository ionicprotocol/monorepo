'use client';

import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

import ConnectButton from '../_components/ConnectButton';
import ResultHandler from '../_components/ResultHandler';

const claimMessage = (nonce: string) => `Welcome to the $ION Airdrop!

Sign this message to prove you own this address!

Nonce: ${nonce}`;

const AIRDROP_URL = 'https://airdrop.ionic.ninja';

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
    setPopup(true);
    setLoading(true);
    try {
      const res = await fetch(`${AIRDROP_URL}/address/${account.address}`);
      const [_user]: User[] = await res.json();
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
          <div className="md:text-5xl text-lg md:m-8 m-2 tracking-wider md:gap-y-3 gap-y-1 flex flex-col md:leading-10 leading-6 ">
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
      {popup && (
        <div
          className={`w-full bg-black/40 backdrop-blur-md z-50 flex items-center justify-center min-h-screen fixed top-0 left-0`}
        >
          <div
            className={`md:w-[30%] w-[70%] bg-grayone py-4 px-2 rounded-xl  flex flex-col items-center justify-center min-h-[20vh] `}
          >
            <ResultHandler isLoading={loading}>
              {eligibility === null && (
                <div className="w-full px-2 mt-2 relative  items-center justify-center gap-x-2  cursor-pointer ">
                  <p className="w-full text-lg">Check Eligibility</p>

                  <div className={`bg-accent w-max my-2 rounded-xl text-black`}>
                    <ConnectButton />
                  </div>
                  <button
                    className={`md:w-52 w-max  bg-accent text-darkone rounded-lg py-2 px-6  cursor-pointer text-sm mb-4 font-semibold`}
                    onClick={() => checkEligibility()}
                  >
                    Check
                  </button>

                  <p className=" text-sm text-white/60 mb-3 ">
                    $ION airdrop will be send out to the confirmed eligible
                    wallet addresses by the Ionic Team. Once you sign in with
                    your wallet, no further actions needs to be taken
                  </p>
                </div>
              )}

              {eligibility && eligibility === true ? (
                <div className="flex flex-col my-auto items-center justify-center">
                  <img
                    alt={`Image `}
                    className="md:w-6 w-6 mb-2 "
                    key={'id'}
                    src={'/img/success.png'}
                  />
                  <span className="text-center">
                    Congratulations! You are eligible to receive the $ION
                    airdrop, the first tranche of the airdrop will be
                    distributed to all participants on May 30th by the team.
                    Your wallet address has been recorded and no further action
                    is needed from your side.
                  </span>
                </div>
              ) : eligibility === false ? (
                <div className="flex flex-col my-auto items-center justify-center ">
                  <img
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
                {claimed ? 'Claimed' : 'Claim Tokens'}
              </button>
            ) : (
              <button
                className={`mt-auto w-full bg-accent text-darkone rounded-lg py-2 px-6  cursor-pointer text-sm `}
                onClick={() => setPopup(false)}
              >
                Back to Claim
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
