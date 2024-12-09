import React from 'react';

interface IApproved {
  status?: string;
}
const Approved = ({ status = 'STEP0' }: IApproved) => {
  return (
    <div
      className={`flex w-[70%] my-4 mx-auto items-center justify-between relative `}
    >
      <div
        className={`z-10 ${
          status === 'STEP0'
            ? 'bg-stone-600'
            : status === 'STEP1' || status === 'STEP2'
              ? 'bg-accent'
              : null
        } w-6 h-6 flex items-center justify-center text-darkone rounded-full  text-xs`}
      >
        {status === 'STEP2' ? '✔️' : '1'}
      </div>
      <div className={`absolute top-1/2 -translate-y-1/2 h-1 z-0 w-full `}>
        <div
          className={`w-full h-full ${
            status === 'STEP2' || status === 'STEP1'
              ? 'bg-accent'
              : 'bg-stone-600'
          }`}
        />
        {/* <div></div> */}
      </div>
      <div
        className={`z-10 ${
          status === 'STEP0' || status === 'STEP1'
            ? 'bg-grayUnselect border border-stone-600 text-stone-500'
            : status === 'STEP2'
              ? 'bg-accent text-darkone'
              : null
        } w-6 h-6 flex items-center justify-center  rounded-full  text-xs`}
      >
        2
      </div>
    </div>
  );
};

export default Approved;
