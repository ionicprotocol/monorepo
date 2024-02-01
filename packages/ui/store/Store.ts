import { create } from 'zustand';

interface IStore {
  darkmode: boolean;
  popmode: boolean;
  setPopmode: (val: boolean) => void;
  setDarkmode: (val: boolean) => void;
}

export const useStore = create<IStore>((set) => ({
  darkmode: true,
  popmode: false,
  setDarkmode: (data: boolean) =>
    set((state) => ({ ...state, darkmode: data })),
  setPopmode: (data: boolean) => set((state) => ({ ...state, popmode: data }))
}));
