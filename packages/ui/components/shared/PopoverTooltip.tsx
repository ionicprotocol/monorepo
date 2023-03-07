import {
  Box,
  BoxProps,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverBodyProps,
  PopoverContent,
  PopoverContentProps,
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
  hideArrow = true,
  visible = true,
  contentProps,
  popoverProps,
}: {
  children: PopoverProps['children'];
  header?: PopoverHeaderProps['children'];
  body?: PopoverBodyProps['children'];
  footer?: PopoverFooterProps['children'];
  width?: BoxProps['width'];
  height?: BoxProps['height'];
  hideArrow?: boolean;
  visible?: boolean;
  contentProps?: PopoverContentProps;
  popoverProps?: PopoverProps;
  headerProps?: PopoverHeaderProps;
  bodyProps?: PopoverBodyProps;
  footerProps?: PopoverFooterProps;
}) => {
  const { cPage } = useColors();
  if (!visible) return <>{children}</>;

  return (
    <Box height={height} width={width}>
      <Popover placement="bottom-end" trigger="hover" {...popoverProps}>
        <PopoverTrigger>{children}</PopoverTrigger>
        {header || body || footer ? (
          <PopoverContent
            maxWidth={{ base: '300px', sm: '400px', md: '500px' }}
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
            {header && <PopoverHeader>{header}</PopoverHeader>}
            {body && <PopoverBody>{body}</PopoverBody>}
            {footer && <PopoverFooter>{footer}</PopoverFooter>}
          </PopoverContent>
        ) : null}
      </Popover>
    </Box>
  );
};
