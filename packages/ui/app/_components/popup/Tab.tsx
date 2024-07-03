import { PopupMode } from './page';
interface IMode {
  active: PopupMode;
  loopPossible: boolean;
  mode: PopupMode;
  setActive: (val: PopupMode) => void;
}
const Tab = ({ loopPossible, mode, setActive, active }: IMode) => {
  return (
    <div
      className={`w-[94%] mx-auto rounded-lg bg-grayone ${
        mode === PopupMode.INSTANTSUPPLY && 'hidden'
      }py-1 flex text-center gap-x-1 text-xs items-center justify-center`}
    >
      {(mode === PopupMode.SUPPLY || mode === PopupMode.WITHDRAW) && (
        <>
          <p
            className={`rounded-md py-1 text-center w-full cursor-pointer ${
              active === PopupMode.SUPPLY
                ? 'bg-darkone text-accent '
                : 'text-white/40 '
            } transition-all duration-200 ease-linear `}
            onClick={() => setActive(PopupMode.SUPPLY)}
          >
            COLLATERAL
          </p>
          <p
            className={` rounded-md py-1 px-3  w-full ${
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
      {(mode === PopupMode.BORROW ||
        mode === PopupMode.REPAY ||
        mode === PopupMode.LOOP) && (
        <>
          <p
            className={` rounded-md py-1 px-3  w-full ${
              active === PopupMode.BORROW
                ? 'bg-darkone text-accent '
                : 'text-white/40'
            } cursor-pointer transition-all duration-200 ease-linear`}
            onClick={() => setActive(PopupMode.BORROW)}
          >
            BORROW
          </p>
          <p
            className={` rounded-md py-1 px-3 w-full  ${
              active === PopupMode.REPAY
                ? 'bg-darkone text-accent '
                : 'text-white/40'
            } cursor-pointer transition-all duration-200 ease-linear`}
            onClick={() => setActive(PopupMode.REPAY)}
          >
            REPAY
          </p>

          {loopPossible && (
            <p
              className={` rounded-md py-1 px-3  w-full ${
                active === PopupMode.LOOP
                  ? 'bg-darkone text-accent '
                  : 'text-white/40'
              } cursor-pointer transition-all duration-200 ease-linear`}
              onClick={() => setActive(PopupMode.LOOP)}
            >
              LOOP
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Tab;
