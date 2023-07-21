import { useColorMode } from '@chakra-ui/react';
import { darkTheme, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { ReactNode } from 'react';

import { COLOR_PALETTE } from '@ui/theme/index';
import { chains } from '@ui/utils/connectors';

const RainbowKit = ({ children }: { children: ReactNode }) => {
  const { colorMode } = useColorMode();

  return (
    <RainbowKitProvider
      chains={chains}
      showRecentTransactions={true}
      theme={
        colorMode === 'light'
          ? {
              ...lightTheme(),
              blurs: {
                modalOverlay: 'blur(8px)'
              },
              colors: {
                ...lightTheme().colors,
                accentColor: COLOR_PALETTE.ecru,
                accentColorForeground: COLOR_PALETTE.raisinBlack,
                connectButtonBackground: COLOR_PALETTE.ecru,
                connectButtonBackgroundError: COLOR_PALETTE.ecru,
                connectButtonText: COLOR_PALETTE.raisinBlack,
                connectButtonTextError: COLOR_PALETTE.raisinBlack,
                modalBackground: COLOR_PALETTE.whiteBg,
                modalBorder: COLOR_PALETTE.ecru,
                modalText: COLOR_PALETTE.raisinBlack,
                modalTextSecondary: COLOR_PALETTE.raisinBlack
              },
              radii: {
                actionButton: '12px',
                connectButton: '12px',
                menuButton: '12px',
                modal: '12px',
                modalMobile: '12px'
              }
            }
          : {
              ...darkTheme(),
              blurs: {
                modalOverlay: 'blur(8px)'
              },
              colors: {
                ...darkTheme().colors,
                accentColor: COLOR_PALETTE.ecru,
                accentColorForeground: COLOR_PALETTE.raisinBlack,
                connectButtonBackground: COLOR_PALETTE.ecru,
                connectButtonBackgroundError: COLOR_PALETTE.ecru,
                connectButtonText: COLOR_PALETTE.raisinBlack,
                connectButtonTextError: COLOR_PALETTE.raisinBlack,
                modalBackground: COLOR_PALETTE.raisinBlack,
                modalBorder: COLOR_PALETTE.ecru,
                modalText: COLOR_PALETTE.whiteBg,
                modalTextSecondary: COLOR_PALETTE.whiteBg
              },
              radii: {
                actionButton: '12px',
                connectButton: '12px',
                menuButton: '12px',
                modal: '12px',
                modalMobile: '12px'
              }
            }
      }
    >
      {children}
    </RainbowKitProvider>
  );
};

export default RainbowKit;
