// import type { Dispatch, SetStateAction } from 'react';
import { create } from 'zustand';

import type { Address } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

type SupplyPopoverProps = {
  asset: string;
  cToken: Address;
  dropdownSelectedChain: number;
  pool: Address;
  selectedPoolId: string;
  supplyAPR?: number;
  rewards?: FlywheelReward[];
};

type BorrowPopoverProps = {
  dropdownSelectedChain: number;
  borrowAPR?: number;
  rewardsAPR?: number;
  selectedPoolId: string;
  asset: string;
  cToken: Address;
  pool: Address;
  rewards?: FlywheelReward[];
};

interface IFeaturedBorrow extends BorrowPopoverProps {
  // asset: string;
  // isVerified: boolean;
  loopPossible: boolean;
}
interface IFeaturedSupply extends SupplyPopoverProps {
  // asset: string;
  // isVerified: boolean;
  supplyAPRTotal: number | undefined;
}

interface IStore {
  dropChain: string;
  setDropChain: (val: string) => void;
}

export const useStore = create<IStore>((set) => ({
  dropChain: '34443',
  setDropChain: (data: string) =>
    set((state) => ({ ...state, dropChain: data }))
}));
