import { Tooltip, TooltipProps } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export const SimpleTooltip = ({
  label,
  children,
  ...tooltipProps
}: {
  label: string;
} & TooltipProps) => {
  const { cPage } = useColors();
  return (
    <>
      <style>
        {`
            .chakra-tooltip__arrow {
              border-right: 1px solid ${cPage.primary.borderColor};
              border-bottom: 1px solid ${cPage.primary.borderColor};
            }
        `}
      </style>
      <Tooltip
        hasArrow
        bg={cPage.primary.bgColor}
        placement={'top'}
        aria-label={label}
        label={label}
        {...tooltipProps}
      >
        {children}
      </Tooltip>
    </>
  );
};
