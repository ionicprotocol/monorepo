import type {
  BoxProps,
  PopoverBodyProps,
  PopoverContentProps,
  PopoverFooterProps,
  PopoverHeaderProps,
  PopoverProps,
} from '@chakra-ui/react';
import {
  Box,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export const PopoverTooltip = ({
  children,
  header,
  headerProps,
  body,
  bodyProps,
  boxProps,
  footer,
  footerProps,
  width,
  height,
  hideArrow = true,
  visible = true,
  contentProps,
  popoverProps,
}: {
  body?: PopoverBodyProps['children'];
  bodyProps?: PopoverBodyProps;
  boxProps?: BoxProps;
  children: PopoverProps['children'];
  contentProps?: PopoverContentProps;
  footer?: PopoverFooterProps['children'];
  footerProps?: PopoverFooterProps;
  header?: PopoverHeaderProps['children'];
  headerProps?: PopoverHeaderProps;
  height?: BoxProps['height'];
  hideArrow?: boolean;
  popoverProps?: PopoverProps;
  visible?: boolean;
  width?: BoxProps['width'];
}) => {
  const { cPage } = useColors();
  if (!visible) return <>{children}</>;

  return (
    <Box height={height} width={width} {...boxProps}>
      <Popover placement="bottom-end" trigger="hover" {...popoverProps}>
        <PopoverTrigger>{children}</PopoverTrigger>
        {header || body || footer ? (
          <PopoverContent
            maxWidth={{ base: '300px', md: '450px', sm: '400px' }}
            onClick={(e) => e.stopPropagation()}
            overflowX="auto"
            style={{ cursor: 'default' }}
            textAlign="start"
            width="auto"
            {...contentProps}
          >
            {!hideArrow && (
              <PopoverArrow
                sx={{
                  '--popper-arrow-shadow-color': cPage.primary.borderColor,
                }}
              />
            )}
            {header && <PopoverHeader {...headerProps}>{header}</PopoverHeader>}
            {body && <PopoverBody {...bodyProps}>{body}</PopoverBody>}
            {footer && <PopoverFooter {...footerProps}>{footer}</PopoverFooter>}
          </PopoverContent>
        ) : null}
      </Popover>
    </Box>
  );
};
