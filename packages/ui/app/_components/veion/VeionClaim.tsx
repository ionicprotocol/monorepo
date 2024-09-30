'use client';

import ProgressSteps from '../xION/ProgressSteps';

interface Iprop {
  claimVeionRef: any;
  claimVeionOpen: boolean;
  toggle: () => void;
}
export default function VeionClaim({
  claimVeionRef,
  claimVeionOpen,
  toggle
}: Iprop) {
  return (
    <div
      className={` z-50 fixed top-0 right-0 w-full h-screen  bg-black/35 ${
        claimVeionOpen ? 'flex' : 'hidden'
      } items-center justify-center transition-opacity duration-300 overflow-y-auto animate-fade-in animated backdrop-blur-sm `}
    >
      <div
        ref={claimVeionRef}
        className="bg-grayUnselect py-4 px-6 rounded-md  md:w-[35%] w-[80%]  flex flex-col items-center justify-center "
      >
        <div
          className={`  mb-5 text-xl  flex items-center justify-center h-max relative`}
        >
          <div className="flex items-center self-center">
            {' '}
            <img
              alt="close"
              className={` h-6 cursor-pointer `}
              src="/img/logo/ION.png"
            />{' '}
            <img
              alt="close"
              className={` h-6 cursor-pointer -translate-x-1`}
              src="/img/logo/ETH.png"
            />
          </div>
          <img
            alt="close"
            className={` h-5 cursor-pointer float-right absolute top-0 right-0  `}
            src="/img/assets/close.png"
          />
        </div>
        <p className=""> Claim ION/ETH Balancer LP </p>
        <p className="text-white/50 text-[10px]">
          {' '}
          Return veION #0012 and receive 15.003 LP{' '}
        </p>

        <div
          className={` w-full  md:flex justify-between md:justify-center md:px-0 items-center mb-2 mt-4 md:mb-0 gap-2`}
        >
          <button
            onClick={() => toggle()}
            className="bg-accent  py-1.5 px-4 w-full text-black rounded-md  "
          >
            Approve
          </button>
          <button className="bg-accent  py-1.5 px-4 w-full text-black rounded-md  ">
            Claim
          </button>
        </div>
        <div className="w-[70%] mx-auto mt-4">
          <ProgressSteps progress={2} />
        </div>
      </div>
    </div>
  );
}
