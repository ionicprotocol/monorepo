'use client';
interface IProp {
  autoLock: boolean;
  setAutoLock: any;
}
// import { useState } from 'react';
import InfoPopover from './InfoPopover';

export default function AutoLock({ autoLock, setAutoLock }: IProp) {
  // const [autoLock, setAutoLock] = useState(false);
  return (
    <div className="w-full flex items-center gap-2  ">
      <div className="w-10 bg-accent rounded-full p-[1px]   flex transition-all duration-500 ease-liner">
        <div
          className={`w-5 h-5 cursor-pointer rounded-xl transition-all duration-200 ease-liner bg-black ${autoLock ? 'translate-x-0' : 'translate-x-[93%]'}`}
          onClick={() => setAutoLock((p: any) => !p)}
        />
      </div>
      <div className="text-white/50 text-sm ">
        AutoLock <InfoPopover content="The auto-prolong option extends the lock indefinitely, which keeps your voting power at the same peak level. You can disable this option any time later." />
      </div>
    </div>
  );
}
