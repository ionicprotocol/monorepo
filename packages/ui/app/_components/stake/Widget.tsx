'use client';

import { LiFiWidget } from '@lifi/widget';

import { widgetConfig } from 'ui/app/_constants/mock';

interface IProps {
  close: () => void;
}

export default function Widget({ close }: IProps) {
  return (
    <div
      className={` z-50 fixed top-0 right-0 w-full h-screen  bg-black/35 flex items-center justify-center transition-opacity duration-300 overflow-y-auto animate-fade-in animated backdrop-blur-sm`}
    >
      <div
        className={`w-max h-max relative flex flex-col items-center justify-center`}
      >
        <LiFiWidget
          integrator="Ionic Money"
          config={widgetConfig}
        />
        <button
          className={`my-4 py-1.5 text-sm text-black w-full bg-accent rounded-md`}
          onClick={() => close()}
        >
          Completed Step 1 🎉
        </button>
      </div>
    </div>
  );
}

// export default dynamic(() => Promise.resolve(Widget), { ssr: false });
