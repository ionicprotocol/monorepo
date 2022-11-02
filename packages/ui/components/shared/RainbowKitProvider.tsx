import { useColorModeValue } from '@chakra-ui/react';
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ReactNode } from 'react';

import { COLOR_PALETTE } from '@ui/theme/index';
import { chains } from '@ui/utils/connectors';

const RainbowKit = ({ children }: { children: ReactNode }) => {
  return (
    <RainbowKitProvider
      chains={chains}
      theme={{
        ...darkTheme(),
        blurs: {
          modalOverlay: 'small',
        },
        colors: {
          ...darkTheme().colors,
          accentColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
          accentColorForeground: useColorModeValue(
            COLOR_PALETTE.raisinBlack,
            COLOR_PALETTE.raisinBlack
          ),
          closeButton: useColorModeValue(COLOR_PALETTE.raisinBlack, COLOR_PALETTE.whiteBg),
          modalBackground: useColorModeValue(COLOR_PALETTE.whiteBg, COLOR_PALETTE.raisinBlack),
        },
      }}
    >
      {children}
    </RainbowKitProvider>
  );
};

export default RainbowKit;
