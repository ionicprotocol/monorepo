import { extendTheme, ThemeConfig } from '@chakra-ui/react';

import { LinkStyleConfig } from './components/Link';

import { AvatarStyleConfig } from '@theme/components/Avatar';
import { ButtonStyleConfig } from '@theme/components/Button';
import { IconButtonStyleConfig } from '@theme/components/IconButton';
import { InputConfigStyle } from '@theme/components/Input';
import { ModalStyleConfig } from '@theme/components/Modal';
import { PopoverStyleConfig } from '@theme/components/Popover';
import { SelectConfigStyle } from '@theme/components/Select';
import { StatStyleConfig } from '@theme/components/Stat';
import { TooltipStyleConfig } from '@theme/components/Tooltip';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

export const COLOR_PALETTE = {
  success: '#48BB78',
  fail: '#F56565',
  warn: '#ECC94B',
  grullo: '#B29E84',
  grullo30: '#B29E844d',
  ecru: '#C2B487',
  ecru30: '#575245', // alpha 0.3
  ecru80: '#c2b487cc', // alpha 0.8
  bone: '#D3D4C7',
  white: '#FFFFFF',
  white50: '#FFFFFF80',
  whiteBg: '#F6F4F1',
  silverMetallic: '#A5ADB4',
  silverMetallic30: '#DEDEDE',
  silverMetallic80: '#8c9298',
  gunmetal: '#253439',
  gunmetal80: '#253439CC',
  raisinBlack: '#282828',
  raisinBlack80: '#282828CC',
};

export const theme = extendTheme({
  config,
  fonts: {
    body: 'Avenir Next',
    heading: 'Avenir Next',
  },
  colors: {
    nav: {
      50: '#F0FFF4',
      100: '#41C143',
      200: '#9AE6B4',
      300: '#68D391',
      400: '#48BB78',
      500: '#38A169',
      600: '#2F855A',
      700: '#276749',
      800: '#22543D',
      900: '#1C4532',
    },
    ...COLOR_PALETTE,
  },
  components: {
    Avatar: AvatarStyleConfig,
    Button: ButtonStyleConfig,
    IconButton: IconButtonStyleConfig,
    Input: InputConfigStyle,
    Link: LinkStyleConfig,
    Modal: ModalStyleConfig,
    NumberInput: InputConfigStyle,
    Popover: PopoverStyleConfig,
    Select: SelectConfigStyle,
    Stat: StatStyleConfig,
    Tooltip: TooltipStyleConfig,
  },
});

export default theme;
