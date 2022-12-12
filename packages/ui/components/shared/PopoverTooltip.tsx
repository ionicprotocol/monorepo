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
  width,
  height,
  maxWidth,
  ...popoverProps
}: {
  header?: PopoverHeaderProps['children'];
  body?: PopoverBodyProps['children'];
  footer?: PopoverFooterProps['children'];
  placement?: string;
  width?: string;
  height?: string;
  maxWidth?: string;
} & PopoverProps) => {
  const { cPage } = useColors();

  return (
    <Box width={width} height={height}>
      <Popover placement="top" trigger="hover" {...popoverProps}>
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverContent
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'default' }}
          width="auto"
          maxWidth={maxWidth ? maxWidth : '300px'}
          textAlign="start"
        >
          <PopoverArrow
            sx={{
              '--popper-arrow-shadow-color': cPage.primary.borderColor,
            }}
          />
          {header && <PopoverHeader>{header}</PopoverHeader>}
          {body && <PopoverBody>{body}</PopoverBody>}
          {footer && <PopoverFooter>{footer}</PopoverFooter>}
        </PopoverContent>
      </Popover>
    </Box>
  );
};
