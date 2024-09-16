/* eslint-disable @next/next/no-img-element */
'use client';

export default function VeIon() {
  return (
    <div className="lg:min-h-screen bg-darkone  flex justify-center items-center">
      <div className="lg:size-[60%] lg:p-8 lg:pt-12 p-4 pt-8 text-white bg-grayone xl:rounded-3xl xl:space-y-6 space-y-8">
        <p className="xl:text-xl text-2xl font-semibold flex gap-2">
          Participate in{' '}
          <span className="text-green-400 flex gap-2 items-center">
            Emission
          </span>
        </p>
        <main className="h-full text-white/60 grid grid-cols-3 xl:gap-4 gap-3 gap-y-7">
          <div className="xl:col-span-1 space-y-3 bg-graylite p-2 xl:p-5 rounded-2xl">
            <p className="text-sm text-left xl:text-xs tracking-wider font-light">
              incentive Market on your favourite chain chang in the slug
            </p>
          </div>
          <div className="xl:col-span-1 space-y-3 bg-graylite p-2 xl:p-5 rounded-2xl">
            <p className="text-sm text-left xl:text-xs tracking-wider font-light">
              incentive Market on your favourite chain chang in the slug
            </p>
          </div>
          <div className="xl:col-span-1 space-y-3 bg-graylite p-2 xl:p-5 rounded-2xl">
            <p className="text-sm text-left xl:text-xs tracking-wider font-light">
              incentive Market on your favourite chain chang in the slug
            </p>
          </div>
          <div className="xl:col-span-1 col-span-2 space-y-3 bg-graylite p-5 rounded-2xl">
            <p className="text-xs font-light">TOTAL LP</p>
            <div className="flex gap-3">
              <span className="flex">
                <img
                  src="/ionic-sq.png"
                  alt="logo"
                  className="size-6 rounded-full"
                />
                <img
                  src="/ionic-sq.png"
                  alt="logo"
                  className="size-6 rounded-full -ml-2"
                />
              </span>
              <p className="text-white font-semibold text-md">$1,234,432.21</p>
            </div>
          </div>
          <div className="xl:col-span-2 col-span-full space-y-3 bg-graylite p-5 rounded-2xl">
            <p className="text-xs font-light">PROVIDE LP ON DEX</p>
            <div className="flex xl:flex-row flex-col items-center justify-between gap-2 xl:gap-6">
              <span className="flex">
                <img
                  src="/ionic-sq.png"
                  alt="logo"
                  className="size-6 rounded-full"
                />
                <img
                  src="/ionic-sq.png"
                  alt="logo"
                  className="size-6 rounded-full -ml-2"
                />
              </span>
              <p className="text-white font-medium text-md ">iON/WETH</p>
              <button className="bg-green-400 p-2 text-grayUnselect rounded-lg text-xs font-bold tracking-tight flex items-center gap-2">
                Add Liquidity
              </button>
              <p className="text-white font-medium text-md">iON/WETH LP</p>
            </div>
          </div>
          <div className="xl:col-span-1 col-span-2 space-y-3 bg-graylite p-5 rounded-2xl">
            <p className="text-xs font-light">TOTAL LP</p>
            <div className="flex gap-3">
              <span className="flex">
                <img
                  src="/ionic-sq.png"
                  alt="logo"
                  className="size-6 rounded-full"
                />
                <img
                  src="/ionic-sq.png"
                  alt="logo"
                  className="size-6 rounded-full -ml-2"
                />
              </span>
              <p className="text-white font-semibold text-md">$1,234,432.21</p>
            </div>
          </div>
          <div className="xl:col-span-2 col-span-full space-y-3 bg-graylite p-5 rounded-2xl">
            <p className="text-xs font-light">PROVIDE LP ON DEX</p>
            <div className="flex xl:flex-row flex-col items-center justify-between gap-2 xl:gap-6">
              <span className="flex">
                <img
                  src="/ionic-sq.png"
                  alt="logo"
                  className="size-6 rounded-full"
                />
                <img
                  src="/ionic-sq.png"
                  alt="logo"
                  className="size-6 rounded-full -ml-2"
                />
              </span>
              <p className="text-white font-medium text-md">iON/WETH</p>
              <button className="bg-green-400 p-2 text-grayUnselect rounded-lg text-xs font-bold tracking-tight flex items-center gap-2">
                Add Liquidity
              </button>
              <p className="text-white font-medium text-md">iON/WETH LP</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
