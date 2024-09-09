'use client';
// import BorrowPopover from './BorrowPopover';

export default function FeaturedMarketTile() {
  return (
    <div
      className={`w-full col-span-3 px-2 lg:px-[2%] xl:px-[3%] flex  flex-col items-center justify-center md:justify-start gap-3 bg-grayone  py-4 rounded-md`}
    >
      {/* this will get maped on basis of featured  */}
      <div className={`grid grid-cols-3 `}>
        <div>
          <img
            src="/img/symbol/32/color/hyusd.png"
            alt="HYUSD Symbol"
            className={`w-3 h-3 inline-block`}
          />
          <span>Hyusd</span>
        </div>
        <div>{/* < BorrowPopover/> */}</div>
        <button>supply</button>
      </div>
      <div className={`grid grid-cols-3 `}>
        <div>
          <img
            src="/img/symbol/32/color/ion.png"
            alt="ion Symbol"
            className={`w-3 h-3 inline-block`}
          />
          <span>IOn</span>
        </div>
        <div>{/* < BorrowPopover/> */}</div>
        <button>Borrow</button>
      </div>
    </div>
  );
}
