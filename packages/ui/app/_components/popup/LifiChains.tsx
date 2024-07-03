/* eslint-disable @next/next/no-img-element */
'use client';

import type { ExtendedChain } from '@lifi/sdk';
import { ChainType, getChains } from '@lifi/sdk';
import { useEffect, useState } from 'react';
import { useChainId } from 'wagmi';

import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

// interface ILifiChain {}
export default function LifiChains() {
  const [lifiChains, setLifiChains] = useState<ExtendedChain[] | undefined>();
  const [showMore, setShowMore] = useState<boolean>(false);
  const chainId = useChainId();

  async function getChainsfromLifi() {
    try {
      const chainsLifi = await getChains({ chainTypes: [ChainType.EVM] });
      setLifiChains(chainsLifi);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    getChainsfromLifi();
  }, []);

  return (
    <div
      className={` flex  ${
        showMore === false ? 'justify-start' : 'justify-start'
      } w-full flex-wrap  gap-2 mb-4 mt-2 items-center `}
    >
      {lifiChains &&
        lifiChains.map((chn, idx) => {
          if (chn.id !== +chainId) return;
          return (
            <div
              key={idx}
              className={`   flex items-center justify-center ${
                +chainId === chn.id
                  ? 'border border-accent rounded-md p-[2px]'
                  : ''
              } `}
            >
              <img
                src={chn.logoURI}
                alt="logo"
                className={` h-7 w-7 rounded-md`}
              />
            </div>
          );
        })}
      {lifiChains && (
        <>
          {lifiChains?.map((chainlifi, idx) => {
            if (showMore === false && idx >= 13) return;
            if (chainlifi.id === +chainId) return;
            return (
              <div
                key={idx}
                className={` cursor-pointer  flex items-center justify-center  `}
                onClick={async () => {
                  await handleSwitchOriginChain(chainlifi.id, +chainId);
                }}
              >
                <img
                  src={chainlifi.logoURI}
                  alt="logo"
                  className={` h-7 w-7 rounded-md`}
                />
              </div>
            );
          })}

          <div
            onClick={() => setShowMore((p) => !p)}
            className={` h-8 ${
              showMore === false ? 'w-8' : 'w-max px-3 py-1'
            } rounded-md bg-grayone flex  items-center justify-center text-sm text-white/60 text-center cursor-pointer`}
          >
            {' '}
            {showMore === false ? '+9' : 'Show Less'}
          </div>
        </>
      )}
    </div>
  );
}
