import { theme as DefaultTheme, extendTheme } from '@chakra-ui/react';

import { AlertStyleConfig } from '@ui/theme/components/Alert';
import { AvatarStyleConfig } from '@ui/theme/components/Avatar';
import { BadgeStyleConfig } from '@ui/theme/components/Badge';
import { ButtonStyleConfig } from '@ui/theme/components/Button';
import { CheckboxStyleConfig } from '@ui/theme/components/Checkbox';
import { DividierStyleConfig } from '@ui/theme/components/Divider';
import { IconButtonStyleConfig } from '@ui/theme/components/IconButton';
import { InputConfigStyle } from '@ui/theme/components/Input';
import { LinkStyleConfig } from '@ui/theme/components/Link';
import { MenuStyleConfig } from '@ui/theme/components/Menu';
import { ModalStyleConfig } from '@ui/theme/components/Modal';
import { PopoverStyleConfig } from '@ui/theme/components/Popover';
import { SelectConfigStyle } from '@ui/theme/components/Select';
import { SliderConfigStyle } from '@ui/theme/components/Slider';
import { StatStyleConfig } from '@ui/theme/components/Stat';
import { SwitchConfigStyle } from '@ui/theme/components/Switch';
import { TabsStyleConfig } from '@ui/theme/components/Tabs';
import { TextStyleConfig } from '@ui/theme/components/Text';
import { TooltipStyleConfig } from '@ui/theme/components/Tooltip';

export const COLOR_PALETTE = {
  // midas colors
  bone: '#EBE6E0',
  ecru: '#BCAC83',
  ecru10: '#373532',
  ecru10alpha: '#bcac831a',
  ecru20: '#46423b',
  ecru20alpha: '#bcac8333',
  ecru30: '#4E4A45',
  ecru30alpha: '#bcac834d',
  ecru80: '#9e9173',
  ecru80alpha: '#bcac83cc',
  fail: '#F56565',
  grullo: '#B29E84',
  grullo30: '#B29E844d',
  gunmetal: '#253439',
  gunmetal80: '#253439CC',
  iBlack: '#0B0B0B',
  iCardBg: '#212227',
  iGray: '#666',
  iGreen: '#39FF88',
  iGreen50: '#39FF8850',
  iLightGray: '#A6A6A6',
  iRed: '#FF3864',
  iRowBg: '#2C2E34',
  iSeparator: '#3D3D3D',
  iWhite: '#F0F0F0',
  iYellow: '#F1F996',
  iYellow50: '#F1F99650',
  raisinBlack: '#282828',
  raisinBlack80: '#282828CC',
  silverMetallic: '#A5ADB4',
  silverMetallic10: '#eeedea',
  silverMetallic10Alpha: '#a5adb41a',
  silverMetallic20: '#e6e6e5',
  silverMetallic30: '#DEDEDE',
  silverMetallic40: '#d6d7d9',
  silverMetallic50: '#ced1d2',
  silverMetallic80: '#8c9298',
  success: '#48BB78',
  warn: '#ECC94B',
  white: '#FFFFFF',
  white50: '#FFFFFF80',
  whiteBg: '#F6F4F1'
};

export const breakpoints = {
  '2xl': '96em', // 1536px
  '3xl': '114em', //1824px
  lg: '62em', // 992px
  md: '48em', // 768px
  sm: '30em', // 480px
  xl: '80em' // 1280px
};

export const theme = extendTheme({
  breakpoints,
  colors: {
    cyan: {
      ...DefaultTheme.colors.cyan,
      '200Alpha100': '#9decf91a',
      '200Alpha200': '#9decf933',
      '600Alpha100': '#00a3c41a',
      '600Alpha200': '#00a3c433'
    },
    gray: {
      ...DefaultTheme.colors.gray,
      '200Alpha100': '#e2e8f01a',
      '200Alpha200': '#e2e8f033',
      '600Alpha100': '#4a55681a',
      '600Alpha200': '#4a556833'
    },
    nav: {
      100: '#41C143',
      200: '#9AE6B4',
      300: '#68D391',
      400: '#48BB78',
      50: '#F0FFF4',
      500: '#38A169',
      600: '#2F855A',
      700: '#276749',
      800: '#22543D',
      900: '#1C4532'
    },
    orange: {
      ...DefaultTheme.colors.orange,
      '200Alpha100': '#fbd38d1a',
      '200Alpha200': '#fbd38d33',
      '600Alpha100': '#c056211a',
      '600Alpha200': '#c0562133'
    },
    purple: {
      ...DefaultTheme.colors.purple,
      '200Alpha100': '#d6bcfa1a',
      '200Alpha200': '#d6bcfa33',
      '600Alpha100': '#6b46c11a',
      '600Alpha200': '#6b46c133'
    },
    ...COLOR_PALETTE
  },
  components: {
    Alert: AlertStyleConfig,
    Avatar: AvatarStyleConfig,
    Badge: BadgeStyleConfig,
    Button: ButtonStyleConfig,
    Checkbox: CheckboxStyleConfig,
    Divider: DividierStyleConfig,
    IconButton: IconButtonStyleConfig,
    Input: InputConfigStyle,
    Link: LinkStyleConfig,
    Menu: MenuStyleConfig,
    Modal: ModalStyleConfig,
    NumberInput: InputConfigStyle,
    Popover: PopoverStyleConfig,
    Select: SelectConfigStyle,
    Slider: SliderConfigStyle,
    Stat: StatStyleConfig,
    Switch: SwitchConfigStyle,
    Tabs: TabsStyleConfig,
    Text: TextStyleConfig,
    Tooltip: TooltipStyleConfig
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false
  },
  fonts: {
    body: 'Poppins, sans-serif',
    heading: 'Poppins, sans-serif',
    mono: 'monospace'
  },
  styles: {
    global: {
      body: {
        // bg: COLOR_PALETTE.bone,
        // color: COLOR_PALETTE.raisinBlack,
      }
    }
  }
});

export default theme;
