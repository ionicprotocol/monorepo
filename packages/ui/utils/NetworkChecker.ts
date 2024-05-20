import { switchChain } from '@wagmi/core';

import { wagmiConfig } from './connectors';

export const handleSwitchOriginChain = async (
  selectedDropdownChain: number,
  walletsChain: number
) => {
  try {
    if (selectedDropdownChain !== walletsChain) {
      await switchChain(wagmiConfig, {
        chainId: selectedDropdownChain
      });
    }
  } catch (err) {}
};
