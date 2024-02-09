import { PopupMode } from './page';
interface IMode {
  active: PopupMode;
  mode: PopupMode;
  setActive: (val: PopupMode) => void;
}
const Tab = ({ mode, setActive, active }: IMode) => {
  return (
    <div
      className={`w-[94%] mx-auto rounded-lg bg-grayone py-1 grid ${'grid-cols-2'} text-center gap-x-1 text-xs items-center justify-center`}
    >
      {(mode === PopupMode.SUPPLY || mode === PopupMode.WITHDRAW) && (
        <>
          <p
            className={`rounded-md py-1 text-center  cursor-pointer ${
              active === PopupMode.SUPPLY
                ? 'bg-darkone text-accent '
                : 'text-white/40 '
            } transition-all duration-200 ease-linear `}
            onClick={() => setActive(PopupMode.SUPPLY)}
          >
            COLLATERAL
          </p>
          <p
            className={` rounded-md py-1 px-3   ${
              active === PopupMode.WITHDRAW
                ? 'bg-darkone text-accent '
                : 'text-white/40'
            } cursor-pointer transition-all duration-200 ease-linear`}
            onClick={() => setActive(PopupMode.WITHDRAW)}
          >
            WITHDRAW
          </p>
        </>
      )}
      {(mode === PopupMode.BORROW || mode === PopupMode.REPAY) && (
        <>
          <p
            className={` rounded-md py-1 px-3   ${
              active === PopupMode.BORROW
                ? 'bg-darkone text-accent '
                : 'text-white/40'
            } cursor-pointer transition-all duration-200 ease-linear`}
            onClick={() => setActive(PopupMode.BORROW)}
          >
            BORROW
          </p>
          <p
            className={` rounded-md py-1 px-3   ${
              active === PopupMode.REPAY
                ? 'bg-darkone text-accent '
                : 'text-white/40'
            } cursor-pointer transition-all duration-200 ease-linear`}
            onClick={() => setActive(PopupMode.REPAY)}
          >
            REPAY
          </p>
        </>
      )}
    </div>
  );
};

export default Tab;
