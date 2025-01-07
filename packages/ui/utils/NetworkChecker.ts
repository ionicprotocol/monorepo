import { switchChain } from '@wagmi/core';

import { wagmiAdapter } from '@ui/config/web3';

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
