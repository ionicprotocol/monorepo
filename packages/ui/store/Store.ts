import type { Dispatch, SetStateAction } from 'react';
import { create } from 'zustand';

import type { BorrowPopoverProps } from 'ui/app/_components/markets/BorrowPopover';
import type { SupplyPopoverProps } from 'ui/app/_components/markets/SupplyPopover';
import type { PopupMode } from 'ui/app/_components/popup/page';

interface IFeaturedBorrow extends BorrowPopoverProps {
  // asset: string;
  // isVerified: boolean;
  loopPossible: boolean
}
interface IFeaturedSupply extends SupplyPopoverProps {
  // asset: string;
  // isVerified: boolean;
}

interface IStore {
  darkmode: boolean;
  borrowAmount: string;
  dropChain: string;
  popmode: boolean;
  featuredBorrow: IFeaturedBorrow;
  featuredSupply: IFeaturedSupply;
  setDarkmode: (val: boolean) => void;
  setFeaturedBorrow: (val: IFeaturedBorrow) => void;
  setFeaturedSupply: (val: IFeaturedSupply) => void;
  setPopmode: (val: boolean) => void;
  setBorrowAmount: (val: string) => void;
  setDropChain: (val: string) => void;
}

export const useStore = create<IStore>((set) => ({
  darkmode: true,
  borrowAmount: '0',
  popmode: false,
  dropChain: '34443',
  featuredBorrow: {
    dropdownSelectedChain: 34443,
    borrowAPR: 0,
    rewardsAPR: 0,
    selectedPoolId: '0',
    asset: '',
    cToken: '0x',
    pool: '0x',
    rewards: [],
    loopPossible: false
  },
  featuredSupply: {
    asset: '',
    cToken: '0x',
    dropdownSelectedChain: 34443,
    pool: '0x',
    selectedPoolId: '0',
    supplyAPR: 0,
    rewards: []
  },
  setFeaturedBorrow: (data: IFeaturedBorrow) =>
    set((state) => ({ ...state, featuredBorrow: data })),
  setFeaturedSupply: (data: IFeaturedSupply) =>
    set((state) => ({ ...state, featuredSupply: data })),
  setDarkmode: (data: boolean) =>
    set((state) => ({ ...state, darkmode: data })),
  setPopmode: (data: boolean) => set((state) => ({ ...state, popmode: data })),
  setBorrowAmount: (data: string) =>
    set((state) => ({ ...state, borrowAmount: data })),
  setDropChain: (data: string) =>
    set((state) => ({ ...state, dropChain: data }))
}));
