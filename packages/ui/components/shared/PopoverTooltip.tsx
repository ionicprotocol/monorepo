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

export const PopoverTooltip = ({
  children,
  header,
  body,
  footer,
  width,
  height,
  ...popoverProps
}: {
  header?: PopoverHeaderProps['children'];
  body?: PopoverBodyProps['children'];
  footer?: PopoverFooterProps['children'];
  placement?: string;
  width?: string;
  height?: string;
} & PopoverProps) => {
  return (
    <Box width={width} height={height}>
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
