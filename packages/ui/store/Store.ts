import { create } from 'zustand';

interface IStore {
  darkmode: boolean;
  borrowAmount: string;
  dropChain: string;
  popmode: boolean;
  setDarkmode: (val: boolean) => void;
  setPopmode: (val: boolean) => void;
  setBorrowAmount: (val: string) => void;
  setDropChain: (val: string) => void;
}

export const useStore = create<IStore>((set) => ({
  darkmode: true,
  borrowAmount: '0',
  popmode: false,
  dropChain: '34443',
  setDarkmode: (data: boolean) =>
    set((state) => ({ ...state, darkmode: data })),
  setPopmode: (data: boolean) => set((state) => ({ ...state, popmode: data })),
  setBorrowAmount: (data: string) =>
    set((state) => ({ ...state, borrowAmount: data })),
  setDropChain: (data: string) =>
    set((state) => ({ ...state, dropChain: data }))
}));
