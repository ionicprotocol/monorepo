import type { TooltipProps } from '@chakra-ui/react';
import { Box, Tooltip } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export const SimpleTooltip = ({
  label,
  children,
  ...tooltipProps
}: TooltipProps & {
  label: string;
}) => {
  const { cPage } = useColors();
  return (
    <Box>
      <Tooltip
        aria-label={label}
        bg={cPage.primary.bgColor}
        hasArrow
        label={label}
        placement={'top'}
        sx={{
          '--popper-arrow-shadow-color': `${cPage.primary.borderColor}`,
        }}
        {...tooltipProps}
      >
        {children}
      </Tooltip>
    </Box>
  );
};
