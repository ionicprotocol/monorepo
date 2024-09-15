'use client';

import ResultHandler from '../ResultHandler';

import { useAllTvlAcrossChain } from '@ui/hooks/useAllTvlAcrossChain';

export default function TotalTvlTile() {
  const { data, isLoading } = useAllTvlAcrossChain();
  // console.log(data);
  return (
    <div
      className={`w-full col-span-3 px-2 lg:px-[2%] xl:px-[3%] flex flex-wrap  flex-col items-center justify-center md:justify-start gap-3 bg-grayone  py-4 rounded-md`}
    >
      <span
        className={` md:mr-auto mx-auto md:mx-0 md:text-xl text-lg font-semibold`}
      >
        Total Protocol TVL{' '}
        <span className={`text-[8px] text-white/50 `}>(ALL CHAIN)</span>{' '}
      </span>
      <div
        className={` w-full   flex flex-wrap   items-center justify-center md:justify-start gap-4`}
      >
        <ResultHandler isLoading={isLoading || !data}>
          {data && (
            <>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 md:text-xs text-[10px]`}>
                  Total Market Size
                </p>
                <p className={`font-semibold md:text-base text-xs`}>
                  $
                  {(data?.totalTvlSupply + data?.totalTvlBorrow).toLocaleString(
                    'en-US',
                    {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2
                    }
                  )}
                </p>
              </div>
              <div
                className={`flex flex-col items-start justify-center gap-y-1`}
              >
                <p className={`text-white/60  md:text-xs text-[10px]`}>
                  Total Supplied
                </p>
                <p className={`font-semibold md:text-base text-xs`}>
                  ${' '}
                  {(data?.totalTvlSupply).toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}{' '}
                </p>
              </div>
              <div
                className={`flex flex-col items-start justify-center gap-y-1`}
              >
                <p className={`text-white/60  md:text-xs text-[10px]`}>
                  Total Borrow
                </p>
                <p className={`font-semibold md:text-base text-xs`}>
                  ${' '}
                  {(data?.totalTvlBorrow).toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}{' '}
                </p>
              </div>
            </>
          )}
        </ResultHandler>
      </div>
    </div>
  );
}
