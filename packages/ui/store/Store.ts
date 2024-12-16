import { create } from 'zustand';

interface IStore {
  dropChain: string;
  setDropChain: (val: string) => void;
}

export const useStore = create<IStore>((set) => ({
  dropChain: '34443',
  setDropChain: (data: string) =>
    set((state) => ({ ...state, dropChain: data }))
}));
