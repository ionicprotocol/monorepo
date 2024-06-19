import type { WidgetConfig } from '@lifi/widget';
import { LiFiWidget } from '@lifi/widget';

const widgetConfig: WidgetConfig = {
  toChain: 34443,
  fromChain: 1,
  fromToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  toToken: '0x18470019bf0e94611f15852f7e93cf5d65bc34ca',
  containerStyle: {
    border: '1px solid #3bff89ff',
    borderRadius: '16px'
  },
  theme: {
    palette: {
      primary: { main: '#3bff89' }
    }
  },
  // theme : { palette : "grey"},
  integrator: 'Ionic Money'
};

interface IProps {
  close: () => void;
}
export const Widget = ({ close }: IProps) => {
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
};
