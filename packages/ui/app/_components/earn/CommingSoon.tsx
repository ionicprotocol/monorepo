'use client';

import Link from 'next/link';

export default function CommingSoon({
  linktoProtocol,
  additionalText

}: {
  linktoProtocol: string;
  additionalText: string;
}) {
  return (
    <>
      <div className=" w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 md:px-3 px-3 gap-x-1 md:grid grid-cols-13  py-4 text-sm text-white md:text-center items-center relative flex flex-col ">
        <div className="col-span-10 text-white/60 ">{additionalText} - Coming Soon </div>
        <div className="col-span-1" />
        <Link
          className="col-span-2 w-full text-xs bg-accent text-darkone rounded-md py-1.5 px-3 font-semibold cursor-pointer mx-auto flex items-center justify-center gap-1.5"
          href={linktoProtocol}
          target="_blank"
        >
          <span>DEPOSIT</span>
          <img
            alt="external-link"
            className={`w-3 h-3`}
            src="https://img.icons8.com/material-outlined/24/external-link.png"
          />
        </Link>
      </div>
    </>
  );
}
