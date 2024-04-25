'use client';
import EarnRows from '../_components/earn/EarnRows';
export default function Lend() {
  return (
    <main className="flex flex-col items-start justify-start px-2 rounded-2xl bg-graylite dark:bg-grayone ">
      <div
        className={`w-full grid grid-cols-13  my-3 px-2  gap-x-1  text-white/40 font-semibold lg:text-center items-start  text-xs `}
      >
        <h1 className="col-span-3 "> ASSETS </h1>
        <h1 className="col-span-2"> PROTOCOL</h1>
        <h1 className="col-span-1"> NETWORK</h1>
        <h1 className="col-span-1"> APR</h1>
        <h1 className="col-span-1"> TVL</h1>
        <h1 className="col-span-3"> </h1>
        <h1 className="col-span-2"> DEPOSITE </h1>
      </div>

      {/* this will get mapped out in future with the possible api data structure mentioned below */}
      <EarnRows />
    </main>
  );
}

/*
const data = {
  asset : '' //name of the asset 
  assetImg : '' //or we can ommit this by naming the image name same to the asset name
  protocol :
  protocolImg : '' 
  Network : "",
  apr : ''
  tvl : ''
}
*/
