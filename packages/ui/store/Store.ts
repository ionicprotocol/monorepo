import { create } from 'zustand';

interface IStore {
  darkmode: boolean;
  passedData?: ILendBorrowData;
  popmode: boolean;
  setDarkmode: (val: boolean) => void;
  setPassedData: (val: ILendBorrowData) => void;
  setPopmode: (val: boolean) => void;
}
interface ILendBorrowData {
  availableAPR: number;
  borrowAPR: number;
  collateralAPR: number;
  lendingSupply: number;
  totalBorrows: number;
  totalCollateral: number;
}

export const useStore = create<IStore>((set) => ({
  darkmode: true,
  passedData: {
    availableAPR: 0,
    borrowAPR: 0,
    collateralAPR: 0,
    lendingSupply: 0,
    totalBorrows: 0,
    totalCollateral: 0
  },
  popmode: false,
  setDarkmode: (data: boolean) =>
    set((state) => ({ ...state, darkmode: data })),
  setPassedData: (data: ILendBorrowData) =>
    set((state) => ({ ...state, passedData: data })),
  setPopmode: (data: boolean) => set((state) => ({ ...state, popmode: data }))
}));
