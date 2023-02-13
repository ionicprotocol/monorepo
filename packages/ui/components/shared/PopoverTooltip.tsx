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
  placement,
  width,
  height,
  maxWidth,
  hideArrow,
  ...popoverProps
}: {
  header?: PopoverHeaderProps['children'];
  body?: PopoverBodyProps['children'];
  footer?: PopoverFooterProps['children'];
  placement?: string;
  width?: string;
  height?: string;
  maxWidth?: string;
  hideArrow?: boolean;
} & PopoverProps) => {
  const { cPage } = useColors();

  return (
    <Box height={height} width={width}>
      <Popover placement={placement ? placement : 'top'} trigger="hover" {...popoverProps}>
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverContent
          maxWidth={maxWidth ? maxWidth : '300px'}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'default' }}
          textAlign="start"
          width="auto"
        >
          {!hideArrow && (
            <PopoverArrow
              sx={{
                '--popper-arrow-shadow-color': cPage.primary.borderColor,
              }}
            />
          )}
          {header && <PopoverHeader>{header}</PopoverHeader>}
          {body && <PopoverBody>{body}</PopoverBody>}
          {footer && <PopoverFooter>{footer}</PopoverFooter>}
        </PopoverContent>
      </Popover>
    </Box>
  );
};
