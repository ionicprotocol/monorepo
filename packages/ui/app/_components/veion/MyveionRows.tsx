'use client';

// import { useState } from 'react';

import ExtendVeion from './ExtendVeion';
import ManagePopup from './ManagePopup';
import VeionClaim from './VeionClaim';

import type { LockedData } from '@ui/constants/mock';
import { useOutsideClick } from '@ui/hooks/useOutsideClick';

// import { useState } from 'react';

export default function MyveionRows({
  id,
  tokensLocked,
  lockedBLP,
  lockExpires,
  votingPower,
  network,
  enableClaim
}: LockedData) {
  // const [veionClaim, setVeionClaim] = useState<boolean>(false);

  const {
    componentRef: claimVeionRef,
    isopen: claimVeionOpen,
    toggle: claimVeionToggle
  } = useOutsideClick();
  const {
    componentRef: extendRef,
    isopen: extendOpen,
    toggle: extendToggle
  } = useOutsideClick();
  const {
    componentRef: manageRef,
    isopen: isManageOpen,
    toggle: manageToggle
  } = useOutsideClick();

  // Contract interactions

  // const { isConnected } = useAccount();
  // const { writeContractAsync } = useWriteContract();

  return (
    <>
      <VeionClaim
        claimVeionRef={claimVeionRef}
        claimVeionOpen={claimVeionOpen}
        toggle={() => claimVeionToggle()}
      />
      <ExtendVeion
        extendRef={extendRef}
        extendOpen={extendOpen}
        toggle={() => extendToggle()}
      />
      <ManagePopup
        manageRef={manageRef}
        isManageOpen={isManageOpen}
        toggleManage={() => manageToggle()}
      />
      <div
        className={`w-full h-full md:grid grid-cols-10 hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 relative *:text-center py-4 *:text-sm *:content-center `}
      >
        {/* <div
        className={`w-full  md:grid grid-cols-10 gap-x-2 md:gap-x-1 col-span-10 py-4 text-[11px] text-white/80 font-semibold md:text-center items-center relative cursor-pointer `}
      > */}
        <h3
          className={` col-span-1 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            ID
          </span>
          <span className={`md:text-center text-right`}> {id}</span>
        </h3>
        <h3
          className={` col-span-2 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            TOKENS LOCKED
          </span>
          <span className={`md:text-center text-right`}> {tokensLocked}</span>
        </h3>
        <h3
          className={` col-span-1 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            LOCKED BLP
          </span>
          <span className={`md:text-center text-right`}>
            {' '}
            {lockedBLP.amount}
          </span>
        </h3>
        <h3
          className={` col-span-1 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            LOCK EXPIRES
          </span>
          <span className={`md:text-center text-right`}>
            {' '}
            {lockExpires.date}
          </span>
        </h3>

        <h3
          className={` col-span-1 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            VOTING POWER
          </span>
          <span className={`md:text-center text-right`}> {votingPower}</span>
        </h3>
        <h3
          className={` col-span-2 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            NETWORK
          </span>
          <span className={`md:text-center text-right`}> {network}</span>
        </h3>

        {enableClaim ? (
          <div
            className={` col-span-2 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2  md:mb-0`}
          >
            <button
              onClick={() => claimVeionToggle()}
              className="bg-accent py-2 px-4 text-black rounded-md mr-2 "
            >
              Claim
            </button>
            <button
              onClick={() => extendToggle()}
              className="bg-accent py-2 px-4 text-black rounded-md mr-2 "
            >
              Extend
            </button>
          </div>
        ) : (
          <div
            className={` col-span-2 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
          >
            <button className="bg-white/10 py-2 px-4 text-white rounded-md mr-2 ">
              Vote
            </button>
            <button
              onClick={() => manageToggle()}
              className="bg-white/10 py-2 px-4 text-white rounded-md mr-2 "
            >
              Manage
            </button>
          </div>
        )}
        {/* </div> */}
      </div>
    </>
  );
}
