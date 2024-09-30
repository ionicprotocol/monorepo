'use client';

import type { LockedDataWithDelegate } from '@ui/constants/mock';

export default function DelegateVeionRows({
  id,
  tokensLocked,
  lockedBLP,
  lockExpires,
  votingPower,
  delegatedTo,
  network,
  readyToDelegate
}: LockedDataWithDelegate) {
  return (
    <div
      className={`w-full h-full md:grid grid-cols-10 hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 relative *:text-center py-4 *:text-sm *:content-center `}
    >
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
        <span className={`md:text-center text-right`}> {lockedBLP.amount}</span>
      </h3>
      <h3
        className={` col-span-1 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
          LOCK EXPIRES
        </span>
        <span className={`md:text-center text-right`}> {lockExpires.date}</span>
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
          DELEGATE TO
        </span>
        <span className={`md:text-center text-right`}> {delegatedTo}</span>
      </h3>
      <h3
        className={` col-span-1 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
          NETWORK
        </span>
        <span className={`md:text-center text-right`}> {network}</span>
      </h3>

      {readyToDelegate ? (
        <button className="bg-accent py-2 px-4 text-black rounded-md mr-2 ">
          Delegate
        </button>
      ) : (
        <button
          disabled={true}
          className="bg-white/10 py-2 px-4 text-white/50 rounded-md mr-2 "
        >
          12:34:420
        </button>
      )}
    </div>
  );
}
