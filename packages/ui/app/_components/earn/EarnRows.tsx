'use client';
interface IEarnRow {
  apr: string; 
  asset: string; //name of the asset
  assetImg: string; //or we can ommit this by naming the image name same to the asset name
  network: string;
  protocol: string;
  protocolImg: string;
  tvl: string;
}
export default function EarnRows() {
  return (
    <div className=" w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 lg:grid  grid-cols-13  py-4 text-sm text-white lg:text-center items-center relative">
      <p className="col-span-3">
        <span>USDC</span>
      </p>
      <h1 className="col-span-2"> Protocol</h1>
      <h1 className="col-span-1"> Network</h1>
      <h1 className="col-span-1"> dskfhjkapr</h1>
      <h1 className="col-span-1"> tvl</h1>
      <h1 className="col-span-3"> </h1>
      <h1 className="col-span-2"> Deposite button</h1>
    </div>
  );
}
