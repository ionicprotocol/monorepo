import { useColorMode } from '@chakra-ui/react';
import { darkTheme, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ReactNode } from 'react';

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
              ...lightTheme({ overlayBlur: 'small' }),
              colors: {
                ...lightTheme().colors,
                accentColor: COLOR_PALETTE.ecru,
                accentColorForeground: COLOR_PALETTE.raisinBlack,
                connectButtonBackground: COLOR_PALETTE.ecru,
                connectButtonText: COLOR_PALETTE.raisinBlack,
                modalBackground: COLOR_PALETTE.whiteBg,
                modalText: COLOR_PALETTE.raisinBlack,
                modalTextSecondary: COLOR_PALETTE.raisinBlack,
                modalBorder: COLOR_PALETTE.ecru,
              },
            }
          : {
              ...darkTheme({ overlayBlur: 'small' }),
              colors: {
                ...darkTheme().colors,
                accentColor: COLOR_PALETTE.ecru,
                accentColorForeground: COLOR_PALETTE.raisinBlack,
                connectButtonBackground: COLOR_PALETTE.ecru,
                connectButtonText: COLOR_PALETTE.raisinBlack,
                modalBackground: COLOR_PALETTE.raisinBlack,
                modalText: COLOR_PALETTE.whiteBg,
                modalTextSecondary: COLOR_PALETTE.whiteBg,
                modalBorder: COLOR_PALETTE.ecru,
              },
            }
      }
    >
      {children}
    </RainbowKitProvider>
  );
};

export default RainbowKit;
