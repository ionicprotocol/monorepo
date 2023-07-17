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
  const { cPage } = useColors();

  return (
    <Box height={height} width={width}>
      <Tooltip
        aria-label={label}
        bg={cPage.primary.bgColor}
        hasArrow
        label={label}
        placement={'top'}
        sx={{
          '--popper-arrow-shadow-color': `${cPage.primary.borderColor}`
        }}
        {...tooltipProps}
      >
        {children}
      </Tooltip>
    </Box>
  );
};
