import type { BoxProps, TooltipProps } from '@chakra-ui/react';
import { Box, Tooltip } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export const SimpleTooltip = ({
  label,
  children,
  height,
  width,
  ...tooltipProps
}: TooltipProps & {
  height?: BoxProps['height'];
  label: string;
  width?: BoxProps['width'];
}) => {
  const { cIPage } = useColors();

  return (
    <Box height={height} width={width}>
      <Tooltip
        aria-label={label}
        bg={cIPage.bgColor}
        hasArrow
        label={label}
        placement={'top'}
        sx={{
          '--popper-arrow-shadow-color': `${cIPage.dividerColor}`,
        }}
        {...tooltipProps}
      >
        {children}
      </Tooltip>
    </Box>
  );
};
