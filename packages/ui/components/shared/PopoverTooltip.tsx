import {
  Box,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverBodyProps,
  PopoverContent,
  PopoverFooter,
  PopoverFooterProps,
  PopoverHeader,
  PopoverHeaderProps,
  PopoverProps,
  PopoverTrigger,
} from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export const PopoverTooltip = ({
  children,
  header,
  body,
  footer,
  ...popoverProps
}: {
  header?: PopoverHeaderProps['children'];
  body?: PopoverBodyProps['children'];
  footer?: PopoverFooterProps['children'];
  placement?: string;
} & PopoverProps) => {
  const { cPage } = useColors();

  return (
    <Box>
      <style>
        {`
        .chakra-popover__arrow {
          border-top: none;
          border-left: none;
          border-right: 1px solid ${cPage.primary.borderColor};
          border-bottom: 1px solid ${cPage.primary.borderColor};
        }
        .chakra-popover__popper a {
          font-weight: bold;
          color: ${cPage.primary.borderColor}
        }
    `}
      </style>
      <Popover placement="top" trigger="hover" {...popoverProps}>
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverContent
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'default' }}
          width="auto"
          maxWidth="300px"
          textAlign="start"
        >
          <PopoverArrow />
          {header && <PopoverHeader>{header}</PopoverHeader>}
          {body && <PopoverBody>{body}</PopoverBody>}
          {footer && <PopoverFooter>{footer}</PopoverFooter>}
        </PopoverContent>
      </Popover>
    </Box>
  );
};
