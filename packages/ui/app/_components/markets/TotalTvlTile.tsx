'use client';

import ResultHandler from '../ResultHandler';

import { useAllTvlAcrossChain } from '@ui/hooks/useAllTvlAcrossChain';

export default function TotalTvlTile() {
  const {data} = useAllTvlAcrossChain();
  console.log(data);
  return (
    <div
      className={`w-full col-span-3 px-2 lg:px-[2%] xl:px-[3%] flex flex-wrap  flex-col items-center justify-center md:justify-start gap-3 bg-grayone  py-4 rounded-md`}
    >
      <span className={` mr-auto text-xl font-semibold`}>TVL </span>
      <div
        className={` w-full   flex flex-wrap   items-center justify-center md:justify-start gap-4`}
      >
        <ResultHandler isLoading={false}>
          <div className={`flex flex-col items-start justify-center  gap-y-1`}>
            <p className={`text-white/60 md:text-xs text-[10px]`}>
              Total Market Size
            </p>
            <p className={`font-semibold md:text-base text-xs`}>$ 420420420</p>
            {/* this neeeds to be changed */}
          </div>
          <div className={`flex flex-col items-start justify-center gap-y-1`}>
            <p className={`text-white/60  md:text-xs text-[10px]`}>
              Total Available
            </p>
            <p className={`font-semibold md:text-base text-xs`}>$ 6969696 </p>
            {/* this neeeds to be changed */}
          </div>
        </ResultHandler>
      </div>
    </div>
  );
}
