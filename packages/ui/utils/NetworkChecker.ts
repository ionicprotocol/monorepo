import {
  base,
  optimism,
  mode,
  bob,
  fraxtal,
  lisk
} from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { switchChain } from '@wagmi/core';

export const projectId = '923645e96d6f05f650d266a32ea7295f';
export const networks = [base, mode, optimism, bob, fraxtal, lisk];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

export const handleSwitchOriginChain = async (
  selectedDropdownChain: number,
  walletsChain: number
) => {
  try {
    if (selectedDropdownChain !== walletsChain) {
      await switchChain(wagmiAdapter.wagmiConfig, {
        chainId: selectedDropdownChain
      });
      return true;
    }
    if (selectedDropdownChain === walletsChain) {
      return true;
    }
  } catch (err) {
    return false;
  }
};
