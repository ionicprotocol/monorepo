import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { ReactNode } from 'react';

import { COLOR_PALETTE } from '@ui/theme/index';
import { chains } from '@ui/utils/connectors';

const RainbowKit = ({ children }: { children: ReactNode }) => {
  return (
    <RainbowKitProvider
      chains={chains}
      showRecentTransactions={true}
      theme={{
        ...darkTheme(),
        blurs: {
          modalOverlay: 'blur(8px)'
        },
        colors: {
          ...darkTheme().colors,
          accentColor: COLOR_PALETTE.iGray,
          accentColorForeground: COLOR_PALETTE.iGreen,
          connectButtonBackground: COLOR_PALETTE.iGray,
          connectButtonBackgroundError: COLOR_PALETTE.iGray,
          connectButtonText: COLOR_PALETTE.iBlack,
          connectButtonTextError: COLOR_PALETTE.iBlack,
          modalBackground: COLOR_PALETTE.iCardBg,
          modalBorder: COLOR_PALETTE.iGray,
          modalText: COLOR_PALETTE.iWhite,
          modalTextSecondary: COLOR_PALETTE.iWhite
        },
        radii: {
          actionButton: '12px',
          connectButton: '12px',
          menuButton: '12px',
          modal: '12px',
          modalMobile: '12px'
        }
      }}
    >
      {children}
    </RainbowKitProvider>
  );
};

export default RainbowKit;
