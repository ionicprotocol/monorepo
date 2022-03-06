import { Tooltip } from '@chakra-ui/react';
import { ReactNode } from 'react';

import { useColors } from '@hooks/useColors';

export const SimpleTooltip = ({
  label,
  children,
}: {
  label: string;
  placement?:
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'auto'
    | 'auto-start'
    | 'auto-end'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'right-start'
    | 'right-end'
    | 'left-start'
    | 'left-end';
  children: ReactNode;
}) => {
  const { textColor, bgColor, borderColor } = useColors();
  return (
    <>
      <style>
        {`
            .chakra-tooltip__arrow {
              border-right: 1px solid ${borderColor};
              border-bottom: 1px solid ${borderColor};
            }
        `}
      </style>
      <Tooltip
        p={1}
        hasArrow
        bg={bgColor}
        color={textColor}
        borderColor={borderColor}
        borderWidth={1}
        textAlign="center"
        zIndex={999999999}
        placement={'top'}
        aria-label={label}
        label={label}
      >
        {children}
      </Tooltip>
    </>
  );
};
